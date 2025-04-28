
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAlertConfigurationDto } from './dto/create-alert-configuration.dto';
import { UpdateAlertConfigurationDto } from './dto/update-alert-configuration.dto';

@Injectable()
export class AlertConfigurationsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createAlertConfigurationDto: CreateAlertConfigurationDto) {
    const { userId } = createAlertConfigurationDto;

    // Check if user exists
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    return this.prisma.alertConfiguration.create({
      data: createAlertConfigurationDto,
    });
  }

  async findAll(userId: string) {
    return this.prisma.alertConfiguration.findMany({
      where: { userId },
    });
  }

  async findOne(id: string) {
    const alertConfiguration = await this.prisma.alertConfiguration.findUnique({
      where: { id },
    });

    if (!alertConfiguration) {
      throw new NotFoundException(`Alert configuration with ID ${id} not found`);
    }

    return alertConfiguration;
  }

  async update(id: string, updateAlertConfigurationDto: UpdateAlertConfigurationDto) {
    // Check if alert configuration exists
    await this.findOne(id);

    return this.prisma.alertConfiguration.update({
      where: { id },
      data: updateAlertConfigurationDto,
    });
  }

  async remove(id: string) {
    // Check if alert configuration exists
    await this.findOne(id);

    await this.prisma.alertConfiguration.delete({
      where: { id },
    });

    return { message: `Alert configuration with ID ${id} successfully deleted` };
  }

  async toggleStatus(id: string) {
    const alertConfiguration = await this.findOne(id);

    return this.prisma.alertConfiguration.update({
      where: { id },
      data: {
        active: !alertConfiguration.active,
      },
    });
  }
}
