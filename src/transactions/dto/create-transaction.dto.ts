
import { IsNotEmpty, IsOptional, IsString, IsEnum, IsNumber, IsDate, IsDateString, Min } from 'class-validator';
import { TransactionType, TransactionStatus } from '@prisma/client';
import { Type } from 'class-transformer';

export class CreateTransactionDto {
  @IsNotEmpty()
  @IsNumber()
  @Min(0.01)
  amount: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNotEmpty()
  @IsDateString()
  date: string | Date;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  reference?: string;

  @IsNotEmpty()
  @IsEnum(TransactionType)
  type: TransactionType;

  @IsOptional()
  @IsEnum(TransactionStatus)
  status?: TransactionStatus;

  @IsNotEmpty()
  @IsString()
  bankAccountId: string;

  @IsNotEmpty()
  @IsString()
  userId: string;

  @IsOptional()
  @IsString()
  reconciliationId?: string;
}
