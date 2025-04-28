
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  Req,
} from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
// import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
// import { RolesGuard } from '../auth/guards/roles.guard';
import { TransactionType, UserRole } from '@prisma/client';

@Controller('transactions')
//@UseGuards(JwtAuthGuard, RolesGuard)
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  create(@Body() createTransactionDto: CreateTransactionDto, @Req() req: any) {
    // If the user is not an admin or accountant, they can only create transactions for themselves
    if (
      req.user.role !== UserRole.ADMIN && 
      req.user.role !== UserRole.ACCOUNTANT &&
      createTransactionDto.userId !== req.user.id
    ) {
      createTransactionDto.userId = req.user.id;
    }
    
    return this.transactionsService.create(createTransactionDto);
  }

  @Get()
  findAll(
    @Query('userId') userId: string,
    @Query('bankAccountId') bankAccountId: string,
    @Query('type') type: TransactionType,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Req() req: any,
  ) {
    // If the user is not an admin or accountant, they can only see their own transactions
    if (
      req.user.role !== UserRole.ADMIN &&
      req.user.role !== UserRole.ACCOUNTANT
    ) {
      userId = req.user.id;
    }
    
    return this.transactionsService.findAll(
      userId,
      bankAccountId,
      type,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.transactionsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateTransactionDto: UpdateTransactionDto,
  ) {
    return this.transactionsService.update(id, updateTransactionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.transactionsService.remove(id);
  }
}
