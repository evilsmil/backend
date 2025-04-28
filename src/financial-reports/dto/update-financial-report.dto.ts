
import { IsOptional, IsString, IsEnum, IsDateString, IsObject } from 'class-validator';
import { ReportType, ReportPeriod } from '@prisma/client';

export class UpdateFinancialReportDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEnum(ReportType)
  type?: ReportType;

  @IsOptional()
  @IsEnum(ReportPeriod)
  period?: ReportPeriod;

  @IsOptional()
  @IsDateString()
  startDate?: string | Date;

  @IsOptional()
  @IsDateString()
  endDate?: string | Date;

  @IsOptional()
  @IsObject()
  data?: any;
}
