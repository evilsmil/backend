
import { IsNotEmpty, IsOptional, IsString, IsEnum, IsNumber, Min, MinLength } from 'class-validator';
import { AccountType } from '@prisma/client';

export class CreateBankAccountDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(4)
  accountNumber: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  balance?: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsNotEmpty()
  @IsEnum(AccountType)
  type: AccountType;

  @IsNotEmpty()
  @IsString()
  institution: string;

  @IsNotEmpty()
  @IsString()
  userId: string;

  @IsOptional()
  @IsString()
  companyId?: string;
}
