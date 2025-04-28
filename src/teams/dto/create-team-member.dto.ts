
import { IsNotEmpty, IsOptional, IsString, IsEnum } from 'class-validator';
import { TeamRole } from '@prisma/client';

export class CreateTeamMemberDto {
  @IsNotEmpty()
  @IsString()
  teamId: string;

  @IsNotEmpty()
  @IsString()
  userId: string;

  @IsOptional()
  @IsEnum(TeamRole)
  role?: TeamRole;
}
