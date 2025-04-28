
import { IsOptional, IsString, IsEnum, IsNumber, Min, MinLength } from 'class-validator';
import { AccountType } from '@prisma/client';

export class UpdateBankAccountDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  @MinLength(4)
  accountNumber?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  balance?: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsEnum(AccountType)
  type?: AccountType;

  @IsOptional()
  @IsString()
  institution?: string;

  @IsOptional()
  @IsString()
  companyId?: string;
}
