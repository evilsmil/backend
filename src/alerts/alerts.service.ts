
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAlertDto } from './dto/create-alert.dto';
import { UpdateAlertDto } from './dto/update-alert.dto';

@Injectable()
export class AlertsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createAlertDto: CreateAlertDto) {
    const { userId } = createAlertDto;

    // Check if user exists
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    return this.prisma.alert.create({
      data: createAlertDto,
    });
  }

  async findAll(userId: string, read?: boolean) {
    const where: any = { userId };
    
    if (read !== undefined) {
      where.status = read ? 'READ' : 'UNREAD';
    }
    
    return this.prisma.alert.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const alert = await this.prisma.alert.findUnique({
      where: { id },
    });

    if (!alert) {
      throw new NotFoundException(`Alert with ID ${id} not found`);
    }

    return alert;
  }

  async update(id: string, updateAlertDto: UpdateAlertDto) {
    // Check if alert exists
    await this.findOne(id);

    return this.prisma.alert.update({
      where: { id },
      data: updateAlertDto,
    });
  }

  async remove(id: string) {
    // Check if alert exists
    await this.findOne(id);

    await this.prisma.alert.delete({
      where: { id },
    });

    return { message: `Alert with ID ${id} successfully deleted` };
  }

  async markAsRead(id: string) {
    // Check if alert exists
    await this.findOne(id);

    return this.prisma.alert.update({
      where: { id },
      data: {
        status: 'READ',
      },
    });
  }

  async markAllAsRead(userId: string) {
    await this.prisma.alert.updateMany({
      where: {
        userId,
        status: 'UNREAD',
      },
      data: {
        status: 'READ',
      },
    });

    return { message: 'All alerts marked as read' };
  }
}
