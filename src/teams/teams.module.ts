
import { Module } from '@nestjs/common';
import { TeamsService } from './teams.service';
import { TeamsController } from './teams.controller';
import { TeamMembersService } from './team-members.service';
import { TeamMembersController } from './team-members.controller';

@Module({
  providers: [TeamsService, TeamMembersService],
  controllers: [TeamsController, TeamMembersController],
  exports: [TeamsService, TeamMembersService],
})
export class TeamsModule {}
