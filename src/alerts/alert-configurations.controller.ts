
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AlertConfigurationsService } from './alert-configurations.service';
import { CreateAlertConfigurationDto } from './dto/create-alert-configuration.dto';
import { UpdateAlertConfigurationDto } from './dto/update-alert-configuration.dto';
// import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
// import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from '@prisma/client';

@Controller('alert-configurations')
//@UseGuards(JwtAuthGuard, RolesGuard)
export class AlertConfigurationsController {
  constructor(private readonly alertConfigurationsService: AlertConfigurationsService) {}

  @Post()
  create(@Body() createAlertConfigurationDto: CreateAlertConfigurationDto, @Req() req: any) {
    // If the user is not an admin, they can only create configurations for themselves
    if (req.user.role !== UserRole.ADMIN && createAlertConfigurationDto.userId !== req.user.id) {
      createAlertConfigurationDto.userId = req.user.id;
    }
    
    return this.alertConfigurationsService.create(createAlertConfigurationDto);
  }

  @Get()
  findAll(@Req() req: any) {
    return this.alertConfigurationsService.findAll(req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.alertConfigurationsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateAlertConfigurationDto: UpdateAlertConfigurationDto,
  ) {
    return this.alertConfigurationsService.update(id, updateAlertConfigurationDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.alertConfigurationsService.remove(id);
  }

  @Patch(':id/toggle')
  toggleStatus(@Param('id') id: string) {
    return this.alertConfigurationsService.toggleStatus(id);
  }
}
