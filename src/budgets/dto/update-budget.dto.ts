
import { IsOptional, IsString, IsNumber, IsDateString, Min } from 'class-validator';

export class UpdateBudgetDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  amount?: number;

  @IsOptional()
  @IsDateString()
  startDate?: string | Date;

  @IsOptional()
  @IsDateString()
  endDate?: string | Date;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  companyId?: string;
}
