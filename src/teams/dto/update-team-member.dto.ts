
import { IsOptional, IsEnum } from 'class-validator';
import { TeamRole } from '@prisma/client';

export class UpdateTeamMemberDto {
  @IsOptional()
  @IsEnum(TeamRole)
  role?: TeamRole;
}
