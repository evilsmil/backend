
import { IsNotEmpty, IsOptional, IsString, IsNumber, IsDateString, Min } from 'class-validator';

export class CreateBudgetDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  amount: number;

  @IsNotEmpty()
  @IsDateString()
  startDate: string | Date;

  @IsNotEmpty()
  @IsDateString()
  endDate: string | Date;

  @IsOptional()
  @IsString()
  category?: string;

  @IsNotEmpty()
  @IsString()
  companyId: string;
}
