
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';

@Injectable()
export class TeamsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createTeamDto: CreateTeamDto) {
    const { companyId } = createTeamDto;

    // Check if company exists
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
    });

    if (!company) {
      throw new NotFoundException(`Company with ID ${companyId} not found`);
    }

    return this.prisma.team.create({
      data: createTeamDto,
    });
  }

  async findAll(companyId?: string) {
    const where = companyId ? { companyId } : {};
    
    return this.prisma.team.findMany({
      where,
      include: {
        company: {
          select: {
            id: true,
            name: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });
  }

  async findOne(id: string) {
    const team = await this.prisma.team.findUnique({
      where: { id },
      include: {
        company: {
          select: {
            id: true,
            name: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    if (!team) {
      throw new NotFoundException(`Team with ID ${id} not found`);
    }

    return team;
  }

  async update(id: string, updateTeamDto: UpdateTeamDto) {
    // Check if team exists
    await this.findOne(id);

    // Check if company exists if companyId provided
    if (updateTeamDto.companyId) {
      const company = await this.prisma.company.findUnique({
        where: { id: updateTeamDto.companyId },
      });

      if (!company) {
        throw new NotFoundException(`Company with ID ${updateTeamDto.companyId} not found`);
      }
    }

    return this.prisma.team.update({
      where: { id },
      data: updateTeamDto,
    });
  }

  async remove(id: string) {
    // Check if team exists
    await this.findOne(id);

    // Delete team members first
    await this.prisma.teamMember.deleteMany({
      where: { teamId: id },
    });

    // Delete team
    await this.prisma.team.delete({
      where: { id },
    });

    return { message: `Team with ID ${id} successfully deleted` };
  }
}
