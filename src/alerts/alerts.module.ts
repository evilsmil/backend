
import { Module } from '@nestjs/common';
import { AlertsService } from './alerts.service';
import { AlertsController } from './alerts.controller';
import { AlertConfigurationsService } from './alert-configurations.service';
import { AlertConfigurationsController } from './alert-configurations.controller';

@Module({
  providers: [AlertsService, AlertConfigurationsService],
  controllers: [AlertsController, AlertConfigurationsController],
  exports: [AlertsService, AlertConfigurationsService],
})
export class AlertsModule {}
