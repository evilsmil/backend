
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';
import { TransactionsService } from '../transactions/transactions.service';
import { TransactionType } from '@prisma/client';

@Injectable()
export class BudgetsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly transactionsService: TransactionsService,
  ) {}

  async create(createBudgetDto: CreateBudgetDto) {
    const { companyId } = createBudgetDto;

    // Check if company exists
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
    });

    if (!company) {
      throw new NotFoundException(`Company with ID ${companyId} not found`);
    }

    return this.prisma.budget.create({
      data: createBudgetDto,
    });
  }

  async findAll(companyId?: string, category?: string) {
    const where: any = {};
    
    if (companyId) {
      where.companyId = companyId;
    }
    
    if (category) {
      where.category = category;
    }
    
    return this.prisma.budget.findMany({
      where,
      include: {
        company: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        startDate: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const budget = await this.prisma.budget.findUnique({
      where: { id },
      include: {
        company: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!budget) {
      throw new NotFoundException(`Budget with ID ${id} not found`);
    }

    return budget;
  }

  async update(id: string, updateBudgetDto: UpdateBudgetDto) {
    // Check if budget exists
    await this.findOne(id);

    // Check if company exists if companyId provided
    if (updateBudgetDto.companyId) {
      const company = await this.prisma.company.findUnique({
        where: { id: updateBudgetDto.companyId },
      });

      if (!company) {
        throw new NotFoundException(`Company with ID ${updateBudgetDto.companyId} not found`);
      }
    }

    return this.prisma.budget.update({
      where: { id },
      data: updateBudgetDto,
    });
  }

  async remove(id: string) {
    // Check if budget exists
    await this.findOne(id);

    await this.prisma.budget.delete({
      where: { id },
    });

    return { message: `Budget with ID ${id} successfully deleted` };
  }

  async getBudgetReport(id: string) {
    const budget = await this.findOne(id);
    
    // Get all company bank accounts
    const bankAccounts = await this.prisma.bankAccount.findMany({
      where: {
        companyId: budget.companyId,
      },
      select: {
        id: true,
      },
    });
    
    const bankAccountIds = bankAccounts.map(account => account.id);
    
    // Get transactions for the budget period
    const transactions = await this.prisma.transaction.findMany({
      where: {
        bankAccountId: {
          in: bankAccountIds,
        },
        date: {
          gte: budget.startDate,
          lte: budget.endDate,
        },
        type: TransactionType.EXPENSE,
        ...(budget.category ? { category: budget.category } : {}),
      },
    });
    
    // Calculate total spent
    const totalSpent = transactions.reduce((sum, transaction) => sum + transaction.amount, 0);
    
    // Calculate budget remaining
    const remaining = budget.amount - totalSpent;
    
    // Calculate percentage used
    const percentageUsed = (totalSpent / budget.amount) * 100;
    
    return {
      budget,
      totalSpent,
      remaining,
      percentageUsed,
      transactionCount: transactions.length,
    };
  }
}
