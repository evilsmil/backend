
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
import { FinancialReportsService } from './financial-reports.service';
import { CreateFinancialReportDto } from './dto/create-financial-report.dto';
import { UpdateFinancialReportDto } from './dto/update-financial-report.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ReportType, UserRole } from '@prisma/client';

@Controller('financial-reports')
@UseGuards(JwtAuthGuard, RolesGuard)
export class FinancialReportsController {
  constructor(private readonly financialReportsService: FinancialReportsService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.ACCOUNTANT)
  create(@Body() createFinancialReportDto: CreateFinancialReportDto) {
    return this.financialReportsService.create(createFinancialReportDto);
  }

  @Get()
  findAll(@Query('type') type: ReportType) {
    return this.financialReportsService.findAll(type);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.financialReportsService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.ACCOUNTANT)
  update(
    @Param('id') id: string,
    @Body() updateFinancialReportDto: UpdateFinancialReportDto,
  ) {
    return this.financialReportsService.update(id, updateFinancialReportDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.ACCOUNTANT)
  remove(@Param('id') id: string) {
    return this.financialReportsService.remove(id);
  }
}
