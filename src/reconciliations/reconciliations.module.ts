
import { Module } from '@nestjs/common';
import { ReconciliationsService } from './reconciliations.service';
import { ReconciliationsController } from './reconciliations.controller';
import { BankAccountsModule } from '../bank-accounts/bank-accounts.module';

@Module({
  imports: [BankAccountsModule],
  providers: [ReconciliationsService],
  controllers: [ReconciliationsController],
  exports: [ReconciliationsService],
})
export class ReconciliationsModule {}
