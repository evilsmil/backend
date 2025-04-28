
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
import { BankAccountsService } from './bank-accounts.service';
import { CreateBankAccountDto } from './dto/create-bank-account.dto';
import { UpdateBankAccountDto } from './dto/update-bank-account.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('bank-accounts')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BankAccountsController {
  constructor(private readonly bankAccountsService: BankAccountsService) {}

  @Post()
  create(@Body() createBankAccountDto: CreateBankAccountDto, @Req() req: any) {
    // If the user is not an admin, they can only create accounts for themselves
    if (req.user.role !== UserRole.ADMIN && createBankAccountDto.userId !== req.user.id) {
      createBankAccountDto.userId = req.user.id;
    }
    
    return this.bankAccountsService.create(createBankAccountDto);
  }

  @Get()
  findAll(
    @Query('userId') userId: string,
    @Query('companyId') companyId: string,
    @Req() req: any,
  ) {
    // If the user is not an admin or accountant, they can only see their own accounts
    if (req.user.role !== UserRole.ADMIN && req.user.role !== UserRole.ACCOUNTANT) {
      userId = req.user.id;
    }
    
    return this.bankAccountsService.findAll(userId, companyId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: any) {
    return this.bankAccountsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateBankAccountDto: UpdateBankAccountDto,
    @Req() req: any,
  ) {
    return this.bankAccountsService.update(id, updateBankAccountDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.bankAccountsService.remove(id);
  }
}
