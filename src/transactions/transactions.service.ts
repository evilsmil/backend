import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { BankAccountsService } from '../bank-accounts/bank-accounts.service';
import { AlertsService } from '../alerts/alerts.service';
import { TransactionType } from '@prisma/client';

@Injectable()
export class TransactionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly bankAccountsService: BankAccountsService,
    private readonly alertsService: AlertsService,
  ) {}

  async create(createTransactionDto: CreateTransactionDto) {
    const { bankAccountId, userId, amount, type } = createTransactionDto;

    // Check if bank account exists
    const bankAccount = await this.prisma.bankAccount.findUnique({
      where: { id: bankAccountId },
    });
    
    if (!bankAccount) return; // Évite les erreurs TS18047 si le compte est null
    

    if (!bankAccount) {
      throw new NotFoundException(`Bank account with ID ${bankAccountId} not found`);
    }

    // Check if user exists
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Create transaction
    const transaction = await this.prisma.transaction.create({
      data: createTransactionDto,
    });

    // Update bank account balance
    const amountToAdd = type === TransactionType.INCOME ? amount : -amount;
    await this.bankAccountsService.updateBalance(bankAccountId, amountToAdd);

    // Check for potential alerts
    await this.checkForAlerts(bankAccountId, userId, amount, type);

    return transaction;
  }

  async findAll(
    userId?: string,
    bankAccountId?: string,
    type?: TransactionType,
    startDate?: Date,
    endDate?: Date,
  ) {
    const where: any = {};
    
    if (userId) {
      where.userId = userId;
    }
    
    if (bankAccountId) {
      where.bankAccountId = bankAccountId;
    }
    
    if (type) {
      where.type = type;
    }
    
    if (startDate || endDate) {
      where.date = {};
      
      if (startDate) {
        where.date.gte = startDate;
      }
      
      if (endDate) {
        where.date.lte = endDate;
      }
    }
    
    return this.prisma.transaction.findMany({
      where,
      include: {
        bankAccount: {
          select: {
            id: true,
            name: true,
            currency: true,
          },
        },
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: {
        date: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id },
      include: {
        bankAccount: {
          select: {
            id: true,
            name: true,
            currency: true,
          },
        },
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        reconciliation: true,
      },
    });

    if (!transaction) {
      throw new NotFoundException(`Transaction with ID ${id} not found`);
    }

    return transaction;
  }

  async update(id: string, updateTransactionDto: UpdateTransactionDto) {
    // Get the original transaction
    const originalTransaction = await this.findOne(id);
    
    // Check if amount or type has changed
    const amountChanged = updateTransactionDto.amount && updateTransactionDto.amount !== originalTransaction.amount;
    const typeChanged = updateTransactionDto.type && updateTransactionDto.type !== originalTransaction.type;
    
    // If amount or type changed, we need to update the bank account balance
    if (amountChanged || typeChanged) {
      // Revert the original transaction effect on balance
      const originalAmountEffect = originalTransaction.type === TransactionType.INCOME
        ? -originalTransaction.amount
        : originalTransaction.amount;
      
      await this.bankAccountsService.updateBalance(
        originalTransaction.bankAccountId,
        originalAmountEffect
      );
      
      // Apply the new transaction effect on balance
      const newAmount = updateTransactionDto.amount || originalTransaction.amount;
      const newType = updateTransactionDto.type || originalTransaction.type;
      
      const newAmountEffect = newType === TransactionType.INCOME ? newAmount : -newAmount;
      
      await this.bankAccountsService.updateBalance(
        originalTransaction.bankAccountId,
        newAmountEffect
      );
    }
    
    // Update the transaction
    const updatedTransaction = await this.prisma.transaction.update({
      where: { id },
      data: updateTransactionDto,
    });
    
    return updatedTransaction;
  }

  async remove(id: string) {
    // Get transaction before deleting it
    const transaction = await this.findOne(id);
    
    // Delete the transaction
    await this.prisma.transaction.delete({
      where: { id },
    });
    
    // Update bank account balance
    const amountToAdd = transaction.type === TransactionType.INCOME 
      ? -transaction.amount 
      : transaction.amount;
    
    await this.bankAccountsService.updateBalance(
      transaction.bankAccountId,
      amountToAdd
    );
    
    return { message: `Transaction with ID ${id} successfully deleted` };
  }

  private async checkForAlerts(
    bankAccountId: string,
    userId: string,
    amount: number,
    type: TransactionType,
  ) {
    const bankAccount = await this.prisma.bankAccount.findUnique({
      where: { id: bankAccountId },
    });
  
    if (!bankAccount) return; // évite toute erreur en cas de compte introuvable
  
    const alertConfigurations = await this.prisma.alertConfiguration.findMany({
      where: {
        userId,
        active: true,
      },
    });
  
    // 🔔 Alerte de solde bas
    const lowBalanceConfig = alertConfigurations.find(
      config => config.type === 'LOW_BALANCE' && config.threshold != null
    );
  
    if (
      lowBalanceConfig &&
      bankAccount.balance != null &&
      lowBalanceConfig.threshold != null &&
      bankAccount.balance < lowBalanceConfig.threshold
    ) {
      await this.alertsService.create({
        message: `Low balance alert: Your account "${bankAccount.name}" balance is below the threshold of ${lowBalanceConfig.threshold} ${bankAccount.currency}`,
        type: 'LOW_BALANCE',
        status: 'UNREAD',
        userId,
      });
    }
  
    // 🔔 Alerte de dépense élevée
    if (type === TransactionType.EXPENSE) {
      const highExpenseConfig = alertConfigurations.find(
        config => config.type === 'HIGH_EXPENSE' && config.threshold != null
      );
  
      if (
        highExpenseConfig &&
        highExpenseConfig.threshold != null &&
        bankAccount.currency &&
        amount > highExpenseConfig.threshold
      ) {
        await this.alertsService.create({
          message: `High expense alert: A transaction of ${amount} ${bankAccount.currency} exceeds your threshold of ${highExpenseConfig.threshold} ${bankAccount.currency}`,
          type: 'HIGH_EXPENSE',
          status: 'UNREAD',
          userId,
        });
      }
    }
  
    // 🔄 Tu peux ajouter d'autres types d'alertes ici
  }
  
}
