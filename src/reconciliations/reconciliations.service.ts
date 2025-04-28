
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReconciliationDto } from './dto/create-reconciliation.dto';
import { UpdateReconciliationDto } from './dto/update-reconciliation.dto';

@Injectable()
export class ReconciliationsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createReconciliationDto: CreateReconciliationDto) {
    const { bankAccountId } = createReconciliationDto;

    // Check if bank account exists
    const bankAccount = await this.prisma.bankAccount.findUnique({
      where: { id: bankAccountId },
    });

    if (!bankAccount) {
      throw new NotFoundException(`Bank account with ID ${bankAccountId} not found`);
    }

    return this.prisma.reconciliation.create({
      data: createReconciliationDto,
    });
  }

  async findAll(bankAccountId?: string, status?: string) {
    const where: any = {};
    
    if (bankAccountId) {
      where.bankAccountId = bankAccountId;
    }
    
    if (status) {
      where.status = status;
    }
    
    return this.prisma.reconciliation.findMany({
      where,
      include: {
        bankAccount: {
          select: {
            id: true,
            name: true,
            accountNumber: true,
          },
        },
        transactions: {
          orderBy: {
            date: 'desc',
          },
        },
      },
      orderBy: {
        date: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const reconciliation = await this.prisma.reconciliation.findUnique({
      where: { id },
      include: {
        bankAccount: {
          select: {
            id: true,
            name: true,
            accountNumber: true,
          },
        },
        transactions: {
          orderBy: {
            date: 'desc',
          },
        },
      },
    });

    if (!reconciliation) {
      throw new NotFoundException(`Reconciliation with ID ${id} not found`);
    }

    return reconciliation;
  }

  async update(id: string, updateReconciliationDto: UpdateReconciliationDto) {
    // Check if reconciliation exists
    await this.findOne(id);

    return this.prisma.reconciliation.update({
      where: { id },
      data: updateReconciliationDto,
    });
  }

  async remove(id: string) {
    // Check if reconciliation exists
    await this.findOne(id);

    // Remove reconciliation ID from associated transactions
    await this.prisma.transaction.updateMany({
      where: {
        reconciliationId: id,
      },
      data: {
        reconciliationId: null,
      },
    });

    // Delete reconciliation
    await this.prisma.reconciliation.delete({
      where: { id },
    });

    return { message: `Reconciliation with ID ${id} successfully deleted` };
  }

  async addTransactionToReconciliation(reconciliationId: string, transactionId: string) {
    // Check if reconciliation exists
    await this.findOne(reconciliationId);

    // Check if transaction exists
    const transaction = await this.prisma.transaction.findUnique({
      where: { id: transactionId },
    });

    if (!transaction) {
      throw new NotFoundException(`Transaction with ID ${transactionId} not found`);
    }

    // Update transaction with reconciliation ID
    return this.prisma.transaction.update({
      where: { id: transactionId },
      data: {
        reconciliationId,
      },
    });
  }

  async removeTransactionFromReconciliation(transactionId: string) {
    // Check if transaction exists
    const transaction = await this.prisma.transaction.findUnique({
      where: { id: transactionId },
    });

    if (!transaction) {
      throw new NotFoundException(`Transaction with ID ${transactionId} not found`);
    }

    // Remove reconciliation ID from transaction
    return this.prisma.transaction.update({
      where: { id: transactionId },
      data: {
        reconciliationId: null,
      },
    });
  }

  async completeReconciliation(id: string) {
    // Check if reconciliation exists
    await this.findOne(id);

    return this.prisma.reconciliation.update({
      where: { id },
      data: {
        status: 'COMPLETED',
      },
    });
  }
}
