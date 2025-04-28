
import { IsNotEmpty, IsOptional, IsString, IsEnum, IsNumber, IsBoolean, Min } from 'class-validator';
import { AlertType } from '@prisma/client';

export class CreateAlertConfigurationDto {
  @IsNotEmpty()
  @IsEnum(AlertType)
  type: AlertType;

  @IsOptional()
  @IsNumber()
  @Min(0)
  threshold?: number;

  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @IsNotEmpty()
  @IsString()
  userId: string;
}
