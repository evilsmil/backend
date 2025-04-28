
import { IsNotEmpty, IsOptional, IsString, IsEnum } from 'class-validator';
import { AlertType, AlertStatus } from '@prisma/client';

export class CreateAlertDto {
  @IsNotEmpty()
  @IsString()
  message: string;

  @IsNotEmpty()
  @IsEnum(AlertType)
  type: AlertType;

  @IsOptional()
  @IsEnum(AlertStatus)
  status?: AlertStatus;

  @IsNotEmpty()
  @IsString()
  userId: string;
}
