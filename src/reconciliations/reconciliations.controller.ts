
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
} from '@nestjs/common';
import { ReconciliationsService } from './reconciliations.service';
import { CreateReconciliationDto } from './dto/create-reconciliation.dto';
import { UpdateReconciliationDto } from './dto/update-reconciliation.dto';
// import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
// import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('reconciliations')
//@UseGuards(JwtAuthGuard, RolesGuard)
export class ReconciliationsController {
  constructor(private readonly reconciliationsService: ReconciliationsService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.ACCOUNTANT)
  create(@Body() createReconciliationDto: CreateReconciliationDto) {
    return this.reconciliationsService.create(createReconciliationDto);
  }

  @Get()
  findAll(
    @Query('bankAccountId') bankAccountId: string,
    @Query('status') status: string,
  ) {
    return this.reconciliationsService.findAll(bankAccountId, status);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.reconciliationsService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.ACCOUNTANT)
  update(
    @Param('id') id: string,
    @Body() updateReconciliationDto: UpdateReconciliationDto,
  ) {
    return this.reconciliationsService.update(id, updateReconciliationDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.ACCOUNTANT)
  remove(@Param('id') id: string) {
    return this.reconciliationsService.remove(id);
  }

  @Post(':id/transactions/:transactionId')
  @Roles(UserRole.ADMIN, UserRole.ACCOUNTANT)
  addTransaction(
    @Param('id') id: string,
    @Param('transactionId') transactionId: string,
  ) {
    return this.reconciliationsService.addTransactionToReconciliation(id, transactionId);
  }

  @Delete('transactions/:transactionId')
  @Roles(UserRole.ADMIN, UserRole.ACCOUNTANT)
  removeTransaction(@Param('transactionId') transactionId: string) {
    return this.reconciliationsService.removeTransactionFromReconciliation(transactionId);
  }

  @Patch(':id/complete')
  @Roles(UserRole.ADMIN, UserRole.ACCOUNTANT)
  completeReconciliation(@Param('id') id: string) {
    return this.reconciliationsService.completeReconciliation(id);
  }
}
