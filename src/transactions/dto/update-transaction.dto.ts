
import { IsOptional, IsString, IsEnum, IsNumber, IsDateString, Min } from 'class-validator';
import { TransactionType, TransactionStatus } from '@prisma/client';

export class UpdateTransactionDto {
  @IsOptional()
  @IsNumber()
  @Min(0.01)
  amount?: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsDateString()
  date?: string | Date;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  reference?: string;

  @IsOptional()
  @IsEnum(TransactionType)
  type?: TransactionType;

  @IsOptional()
  @IsEnum(TransactionStatus)
  status?: TransactionStatus;

  @IsOptional()
  @IsString()
  reconciliationId?: string;
}
