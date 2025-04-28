
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { BankAccountsModule } from './bank-accounts/bank-accounts.module';
import { TransactionsModule } from './transactions/transactions.module';
import { CompaniesModule } from './companies/companies.module';
import { TeamsModule } from './teams/teams.module';
import { BudgetsModule } from './budgets/budgets.module';
import { AlertsModule } from './alerts/alerts.module';
import { ReconciliationsModule } from './reconciliations/reconciliations.module';
import { FinancialReportsModule } from './financial-reports/financial-reports.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    UsersModule,
    AuthModule,
    BankAccountsModule,
    TransactionsModule,
    CompaniesModule,
    TeamsModule,
    BudgetsModule,
    AlertsModule,
    ReconciliationsModule,
    FinancialReportsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
