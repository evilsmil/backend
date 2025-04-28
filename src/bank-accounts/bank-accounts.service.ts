
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBankAccountDto } from './dto/create-bank-account.dto';
import { UpdateBankAccountDto } from './dto/update-bank-account.dto';

@Injectable()
export class BankAccountsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createBankAccountDto: CreateBankAccountDto) {
    const { userId, companyId } = createBankAccountDto;

    // Check if user exists
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Check if company exists if companyId provided
    if (companyId) {
      const company = await this.prisma.company.findUnique({
        where: { id: companyId },
      });

      if (!company) {
        throw new NotFoundException(`Company with ID ${companyId} not found`);
      }
    }

    return this.prisma.bankAccount.create({
      data: createBankAccountDto,
    });
  }

  async findAll(userId?: string, companyId?: string) {
    const where: any = {};
    
    if (userId) {
      where.userId = userId;
    }
    
    if (companyId) {
      where.companyId = companyId;
    }
    
    return this.prisma.bankAccount.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        company: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async findOne(id: string) {
    const bankAccount = await this.prisma.bankAccount.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        company: {
          select: {
            id: true,
            name: true,
          },
        },
        transactions: {
          orderBy: {
            date: 'desc',
          },
          take: 10, // Get only the last 10 transactions
        },
      },
    });

    if (!bankAccount) {
      throw new NotFoundException(`Bank account with ID ${id} not found`);
    }

    return bankAccount;
  }

  async update(id: string, updateBankAccountDto: UpdateBankAccountDto) {
    // Check if bank account exists
    await this.findOne(id);

    // Check if company exists if companyId provided
    if (updateBankAccountDto.companyId) {
      const company = await this.prisma.company.findUnique({
        where: { id: updateBankAccountDto.companyId },
      });

      if (!company) {
        throw new NotFoundException(`Company with ID ${updateBankAccountDto.companyId} not found`);
      }
    }

    return this.prisma.bankAccount.update({
      where: { id },
      data: updateBankAccountDto,
    });
  }

  async remove(id: string) {
    // Check if bank account exists
    await this.findOne(id);

    await this.prisma.bankAccount.delete({
      where: { id },
    });

    return { message: `Bank account with ID ${id} successfully deleted` };
  }

  async updateBalance(id: string, amount: number) {
    const bankAccount = await this.findOne(id);
    
    return this.prisma.bankAccount.update({
      where: { id },
      data: {
        balance: bankAccount.balance + amount,
      },
    });
  }
}
