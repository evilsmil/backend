
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { TeamMembersService } from './team-members.service';
import { CreateTeamMemberDto } from './dto/create-team-member.dto';
import { UpdateTeamMemberDto } from './dto/update-team-member.dto';
// import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
// import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('team-members')
//@UseGuards(JwtAuthGuard, RolesGuard)
export class TeamMembersController {
  constructor(private readonly teamMembersService: TeamMembersService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  create(@Body() createTeamMemberDto: CreateTeamMemberDto) {
    return this.teamMembersService.create(createTeamMemberDto);
  }

  @Get()
  findAll(
    @Query('teamId') teamId: string,
    @Query('userId') userId: string,
  ) {
    return this.teamMembersService.findAll(teamId, userId);
  }

  @Get('user/:userId/teams')
  getTeamsByUser(@Param('userId') userId: string) {
    return this.teamMembersService.getTeamsByUser(userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.teamMembersService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  update(
    @Param('id') id: string,
    @Body() updateTeamMemberDto: UpdateTeamMemberDto,
  ) {
    return this.teamMembersService.update(id, updateTeamMemberDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.teamMembersService.remove(id);
  }
}
