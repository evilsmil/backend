
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTeamMemberDto } from './dto/create-team-member.dto';
import { UpdateTeamMemberDto } from './dto/update-team-member.dto';

@Injectable()
export class TeamMembersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createTeamMemberDto: CreateTeamMemberDto) {
    const { teamId, userId } = createTeamMemberDto;

    // Check if team exists
    const team = await this.prisma.team.findUnique({
      where: { id: teamId },
    });

    if (!team) {
      throw new NotFoundException(`Team with ID ${teamId} not found`);
    }

    // Check if user exists
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Check if user is already a member of the team
    const existingMember = await this.prisma.teamMember.findFirst({
      where: {
        teamId,
        userId,
      },
    });

    if (existingMember) {
      throw new ConflictException(`User is already a member of this team`);
    }

    return this.prisma.teamMember.create({
      data: createTeamMemberDto,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        team: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async findAll(teamId?: string, userId?: string) {
    const where: any = {};
    
    if (teamId) {
      where.teamId = teamId;
    }
    
    if (userId) {
      where.userId = userId;
    }
    
    return this.prisma.teamMember.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        team: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async findOne(id: string) {
    const teamMember = await this.prisma.teamMember.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        team: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!teamMember) {
      throw new NotFoundException(`Team member with ID ${id} not found`);
    }

    return teamMember;
  }

  async update(id: string, updateTeamMemberDto: UpdateTeamMemberDto) {
    // Check if team member exists
    await this.findOne(id);

    return this.prisma.teamMember.update({
      where: { id },
      data: updateTeamMemberDto,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        team: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async remove(id: string) {
    // Check if team member exists
    await this.findOne(id);

    await this.prisma.teamMember.delete({
      where: { id },
    });

    return { message: `Team member with ID ${id} successfully deleted` };
  }

  async getTeamsByUser(userId: string) {
    // Check if user exists
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    return this.prisma.teamMember.findMany({
      where: { userId },
      include: {
        team: {
          include: {
            company: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });
  }
}
