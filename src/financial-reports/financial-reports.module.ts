
import { Module } from '@nestjs/common';
import { FinancialReportsService } from './financial-reports.service';
import { FinancialReportsController } from './financial-reports.controller';
import { TransactionsModule } from '../transactions/transactions.module';
import { BankAccountsModule } from '../bank-accounts/bank-accounts.module';

@Module({
  imports: [TransactionsModule, BankAccountsModule],
  providers: [FinancialReportsService],
  controllers: [FinancialReportsController],
  exports: [FinancialReportsService],
})
export class FinancialReportsModule {}
