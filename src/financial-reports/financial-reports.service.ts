
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFinancialReportDto } from './dto/create-financial-report.dto';
import { UpdateFinancialReportDto } from './dto/update-financial-report.dto';
import { TransactionType, ReportType } from '@prisma/client';

@Injectable()
export class FinancialReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createFinancialReportDto: CreateFinancialReportDto) {
    const { startDate, endDate, type } = createFinancialReportDto;

    // Generate report data based on type
    const data = await this.generateReportData(startDate, endDate, type);

    return this.prisma.financialReport.create({
      data: {
        ...createFinancialReportDto,
        data,
      },
    });
  }

  async findAll(type?: ReportType) {
    const where = type ? { type } : {};
    
    return this.prisma.financialReport.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const report = await this.prisma.financialReport.findUnique({
      where: { id },
    });

    if (!report) {
      throw new NotFoundException(`Financial report with ID ${id} not found`);
    }

    return report;
  }

  async update(id: string, updateFinancialReportDto: UpdateFinancialReportDto) {
    // Check if financial report exists
    await this.findOne(id);

    // If start date, end date, or type is changing, regenerate data
    if (
      updateFinancialReportDto.startDate || 
      updateFinancialReportDto.endDate || 
      updateFinancialReportDto.type
    ) {
      const report = await this.findOne(id);
      
      const startDate = updateFinancialReportDto.startDate ? new Date(updateFinancialReportDto.startDate) : report.startDate;
      const endDate = updateFinancialReportDto.endDate ? new Date(updateFinancialReportDto.endDate) : report.endDate;
      const type = updateFinancialReportDto.type || report.type;
      
      const data = await this.generateReportData(startDate, endDate, type);
      
      updateFinancialReportDto = {
        ...updateFinancialReportDto,
        data,
      };
    }

    return this.prisma.financialReport.update({
      where: { id },
      data: updateFinancialReportDto,
    });
  }

  async remove(id: string) {
    // Check if financial report exists
    await this.findOne(id);

    await this.prisma.financialReport.delete({
      where: { id },
    });

    return { message: `Financial report with ID ${id} successfully deleted` };
  }

  private async generateReportData(startDate: Date | string, endDate: Date | string, type: ReportType) {
    const start = new Date(startDate);
    const end = new Date(endDate);

    switch (type) {
      case ReportType.INCOME_STATEMENT:
        return this.generateIncomeStatement(start, end);
      case ReportType.BALANCE_SHEET:
        return this.generateBalanceSheet(end);
      case ReportType.CASH_FLOW:
        return this.generateCashFlow(start, end);
      default:
        return {};
    }
  }

  private async generateIncomeStatement(startDate: Date, endDate: Date) {
    // Get all income transactions
    const incomeTransactions = await this.prisma.transaction.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
        type: TransactionType.INCOME,
      },
    });

    // Get all expense transactions
    const expenseTransactions = await this.prisma.transaction.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
        type: TransactionType.EXPENSE,
      },
    });

    // Calculate totals
    const totalIncome = incomeTransactions.reduce((sum, transaction) => sum + transaction.amount, 0);
    const totalExpenses = expenseTransactions.reduce((sum, transaction) => sum + transaction.amount, 0);
    const netIncome = totalIncome - totalExpenses;

    // Group income by category
    const incomeByCategory: any = {};
    incomeTransactions.forEach(transaction => {
      const category = transaction.category || 'Uncategorized';
      if (!incomeByCategory[category]) {
        incomeByCategory[category] = 0;
      }
      incomeByCategory[category] += transaction.amount;
    });

    // Group expenses by category
    const expensesByCategory: any = {};
    expenseTransactions.forEach(transaction => {
      const category = transaction.category || 'Uncategorized';
      if (!expensesByCategory[category]) {
        expensesByCategory[category] = 0;
      }
      expensesByCategory[category] += transaction.amount;
    });

    return {
      summary: {
        totalIncome,
        totalExpenses,
        netIncome,
      },
      incomeByCategory,
      expensesByCategory,
      incomeTransactions: incomeTransactions.length,
      expenseTransactions: expenseTransactions.length,
    };
  }

  private async generateBalanceSheet(date: Date) {
    // Get all bank accounts
    const bankAccounts = await this.prisma.bankAccount.findMany();

    // Calculate total assets
    const totalAssets = bankAccounts.reduce((sum, account) => sum + account.balance, 0);

    // Group by account type
    const assetsByType: any = {};
    bankAccounts.forEach(account => {
      if (!assetsByType[account.type]) {
        assetsByType[account.type] = 0;
      }
      assetsByType[account.type] += account.balance;
    });

    // For a simple balance sheet, we'll assume no liabilities or equity data
    // In a real application, you would add tables for those

    return {
      date: date.toISOString(),
      assets: {
        total: totalAssets,
        byType: assetsByType,
        accounts: bankAccounts.map(account => ({
          id: account.id,
          name: account.name,
          type: account.type,
          balance: account.balance,
          currency: account.currency,
        })),
      },
      liabilities: {
        total: 0, // Placeholder for liabilities
      },
      equity: {
        total: totalAssets, // In this simple model, equity = assets
      },
    };
  }

  private async generateCashFlow(startDate: Date, endDate: Date) {
    // Get all transactions in the period
    const transactions = await this.prisma.transaction.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: {
        date: 'asc',
      },
      include: {
        bankAccount: {
          select: {
            name: true,
            currency: true,
          },
        },
      },
    });

    // Calculate cash flow
    const inflow = transactions
      .filter(t => t.type === TransactionType.INCOME)
      .reduce((sum, t) => sum + t.amount, 0);
    
    const outflow = transactions
      .filter(t => t.type === TransactionType.EXPENSE)
      .reduce((sum, t) => sum + t.amount, 0);
    
    const netCashFlow = inflow - outflow;

    // Group cash flow by month
    const cashFlowByMonth: any = {};
    transactions.forEach(transaction => {
      const month = transaction.date.toISOString().substring(0, 7); // YYYY-MM
      
      if (!cashFlowByMonth[month]) {
        cashFlowByMonth[month] = {
          inflow: 0,
          outflow: 0,
          net: 0,
        };
      }
      
      if (transaction.type === TransactionType.INCOME) {
        cashFlowByMonth[month].inflow += transaction.amount;
      } else if (transaction.type === TransactionType.EXPENSE) {
        cashFlowByMonth[month].outflow += transaction.amount;
      }
      
      cashFlowByMonth[month].net = cashFlowByMonth[month].inflow - cashFlowByMonth[month].outflow;
    });

    return {
      period: {
        start: startDate.toISOString(),
        end: endDate.toISOString(),
      },
      summary: {
        inflow,
        outflow,
        netCashFlow,
      },
      byMonth: cashFlowByMonth,
      transactionCount: transactions.length,
    };
  }
}
