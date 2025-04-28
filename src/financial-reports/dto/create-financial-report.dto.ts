
import { IsNotEmpty, IsString, IsEnum, IsDateString } from 'class-validator';
import { ReportType, ReportPeriod } from '@prisma/client';

export class CreateFinancialReportDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsEnum(ReportType)
  type: ReportType;

  @IsNotEmpty()
  @IsEnum(ReportPeriod)
  period: ReportPeriod;

  @IsNotEmpty()
  @IsDateString()
  startDate: string | Date;

  @IsNotEmpty()
  @IsDateString()
  endDate: string | Date;
}
