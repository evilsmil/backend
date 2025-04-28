
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  async cleanDatabase() {
    if (process.env.NODE_ENV === 'production') {
      return;
    }
    
    // Order matters due to foreign key constraints
    const models = [
      'transaction',
      'reconciliation',
      'alertConfiguration',
      'alert',
      'bankAccount',
      'budget',
      'teamMember',
      'team',
      'session',
      'user',
      'company',
      'financialReport',
    ];

    for (const model of models) {
      await this.$executeRawUnsafe(`TRUNCATE TABLE "${model}" CASCADE;`);
    }
  }
}
