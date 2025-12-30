import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { TicketsService } from './tickets.service';
import { CreateTicketDto, UpdateTicketDto, QueryTicketDto } from './dto';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { Public } from '@common/decorators/public.decorator';
import { CurrentUser } from '@common/decorators/current-user.decorator';

@ApiTags('tickets')
@Controller('api/v1/tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Public()
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateTicketDto) {
    if (!dto.lineUserId) {
      throw new BadRequestException('lineUserId is required');
    }

    const ticket = await this.ticketsService.create(dto);
    return {
      success: true,
      data: ticket,
      timestamp: new Date().toISOString(),
    };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'super_admin', 'viewer')
  @ApiBearerAuth()
  @Get()
  async findAll(@Query() query: QueryTicketDto) {
    const result = await this.ticketsService.findAll(query);
    return {
      success: true,
      ...result,
      timestamp: new Date().toISOString(),
    };
  }

  @Public()
  @Get('user/:lineUserId')
  async findByUser(@Param('lineUserId') lineUserId: string) {
    const tickets = await this.ticketsService.findByLineUserId(lineUserId);
    return {
      success: true,
      data: tickets,
      timestamp: new Date().toISOString(),
    };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'super_admin', 'viewer')
  @ApiBearerAuth()
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const ticket = await this.ticketsService.findOne(id);
    return {
      success: true,
      data: ticket,
      timestamp: new Date().toISOString(),
    };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'super_admin')
  @ApiBearerAuth()
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateTicketDto,
    @CurrentUser() user: any,
  ) {
    const ticket = await this.ticketsService.update(id, dto, user.id);
    return {
      success: true,
      data: ticket,
      timestamp: new Date().toISOString(),
    };
  }
}
