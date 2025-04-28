
import { IsOptional, IsString, IsEnum } from 'class-validator';
import { AlertType, AlertStatus } from '@prisma/client';

export class UpdateAlertDto {
  @IsOptional()
  @IsString()
  message?: string;

  @IsOptional()
  @IsEnum(AlertType)
  type?: AlertType;

  @IsOptional()
  @IsEnum(AlertStatus)
  status?: AlertStatus;
}
