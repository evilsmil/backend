
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  Req,
} from '@nestjs/common';
import { AlertsService } from './alerts.service';
import { CreateAlertDto } from './dto/create-alert.dto';
import { UpdateAlertDto } from './dto/update-alert.dto';
// import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
// import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from '@prisma/client';

@Controller('alerts')
//@UseGuards(JwtAuthGuard, RolesGuard)
export class AlertsController {
  constructor(private readonly alertsService: AlertsService) {}

  @Post()
  create(@Body() createAlertDto: CreateAlertDto, @Req() req: any) {
    // If the user is not an admin, they can only create alerts for themselves
    if (req.user.role !== UserRole.ADMIN && createAlertDto.userId !== req.user.id) {
      createAlertDto.userId = req.user.id;
    }
    
    return this.alertsService.create(createAlertDto);
  }

  @Get()
  findAll(@Query('read') read: string, @Req() req: any) {
    let readFilter: boolean | undefined;
    
    if (read === 'true') {
      readFilter = true;
    } else if (read === 'false') {
      readFilter = false;
    }
    
    return this.alertsService.findAll(req.user.id, readFilter);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.alertsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAlertDto: UpdateAlertDto) {
    return this.alertsService.update(id, updateAlertDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.alertsService.remove(id);
  }

  @Patch(':id/read')
  markAsRead(@Param('id') id: string) {
    return this.alertsService.markAsRead(id);
  }

  @Patch('read/all')
  markAllAsRead(@Req() req: any) {
    return this.alertsService.markAllAsRead(req.user.id);
  }
}
