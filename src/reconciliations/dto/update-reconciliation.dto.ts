
import { IsOptional, IsString, IsEnum, IsDateString } from 'class-validator';
import { ReconciliationStatus } from '@prisma/client';

export class UpdateReconciliationDto {
  @IsOptional()
  @IsDateString()
  date?: string | Date;

  @IsOptional()
  @IsString()
  note?: string;

  @IsOptional()
  @IsEnum(ReconciliationStatus)
  status?: ReconciliationStatus;
}
