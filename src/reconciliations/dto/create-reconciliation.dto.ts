
import { IsNotEmpty, IsOptional, IsString, IsEnum, IsDateString } from 'class-validator';
import { ReconciliationStatus } from '@prisma/client';

export class CreateReconciliationDto {
  @IsNotEmpty()
  @IsDateString()
  date: string | Date;

  @IsOptional()
  @IsString()
  note?: string;

  @IsOptional()
  @IsEnum(ReconciliationStatus)
  status?: ReconciliationStatus;

  @IsNotEmpty()
  @IsString()
  bankAccountId: string;
}
