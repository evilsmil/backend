
import { IsOptional, IsEnum, IsNumber, IsBoolean, Min } from 'class-validator';
import { AlertType } from '@prisma/client';

export class UpdateAlertConfigurationDto {
  @IsOptional()
  @IsEnum(AlertType)
  type?: AlertType;

  @IsOptional()
  @IsNumber()
  @Min(0)
  threshold?: number;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
