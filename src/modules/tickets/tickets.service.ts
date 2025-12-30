import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@database/prisma.service';
import { CreateTicketDto, UpdateTicketDto, QueryTicketDto } from './dto';

@Injectable()
export class TicketsService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(dto: CreateTicketDto): Promise<any> {
    // Check if department exists
    const department = await this.prismaService.department.findUnique({
      where: { id: dto.departmentId },
    });

    if (!department) {
      throw new BadRequestException('Department not found');
    }

    // Get or create user
    let user = await this.prismaService.user.findUnique({
      where: { lineUserId: dto.lineUserId },
    });

    if (!user) {
      user = await this.prismaService.user.create({
        data: {
          lineUserId: dto.lineUserId,
          displayName: dto.nickname,
          firstSeenAt: new Date(),
          lastSeenAt: new Date(),
          ticketCount: 0,
        },
      });
    } else {
      await this.prismaService.user.update({
        where: { id: user.id },
        data: { lastSeenAt: new Date() },
      });
    }

    // Generate ticket number
    const ticketNumber = await this.generateTicketNumber();

    // Create ticket
    const ticket = await this.prismaService.ticket.create({
      data: {
        ticketNumber,
        userId: user.id,
        nickname: dto.nickname,
        departmentId: dto.departmentId,
        phone: dto.phone,
        locationBuilding: dto.locationBuilding,
        locationFloor: dto.locationFloor,
        locationRoom: dto.locationRoom,
        locationDetail: dto.locationDetail,
        category: dto.category,
        issueTitle: dto.issueTitle,
        issueDescription: dto.issueDescription,
        priority: dto.priority,
        status: 'pending',
      },
      include: {
        user: true,
        department: true,
      },
    });

    // Create history record
    await this.prismaService.ticketHistory.create({
      data: {
        ticketId: ticket.id,
        action: 'created',
        comment: 'Ticket created',
      },
    });

    // Update user ticket count
    await this.prismaService.user.update({
      where: { id: user.id },
      data: { ticketCount: { increment: 1 } },
    });

    return ticket;
  }

  async findAll(query: QueryTicketDto): Promise<any> {
    const {
      page = 1,
      limit = 25,
      status,
      category,
      priority,
      departmentId,
      assignedTo,
      search,
      startDate,
      endDate,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      isDeleted: false,
    };

    if (status) where.status = status;
    if (category) where.category = category;
    if (priority) where.priority = priority;
    if (departmentId) where.departmentId = departmentId;
    if (assignedTo) where.assignedTo = assignedTo;

    if (search) {
      where.OR = [
        { ticketNumber: { contains: search } },
        { nickname: { contains: search } },
        { issueTitle: { contains: search } },
      ];
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    // Execute query
    const [tickets, total] = await Promise.all([
      this.prismaService.ticket.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          user: true,
          department: true,
          assignedToAdmin: {
            select: {
              id: true,
              fullName: true,
            },
          },
        },
      }),
      this.prismaService.ticket.count({ where }),
    ]);

    return {
      data: tickets,
      meta: {
        total,
        page,
        limit,
        hasMore: skip + tickets.length < total,
      },
    };
  }

  async findOne(id: string): Promise<any> {
    const ticket = await this.prismaService.ticket.findFirst({
      where: { id, isDeleted: false },
      include: {
        user: true,
        department: true,
        assignedToAdmin: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        attachments: {
          orderBy: { displayOrder: 'asc' },
        },
        history: {
          orderBy: { createdAt: 'desc' },
          include: {
            admin: {
              select: {
                id: true,
                fullName: true,
              },
            },
          },
        },
      },
    });

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    return ticket;
  }

  async update(id: string, dto: UpdateTicketDto, adminId: string): Promise<any> {
    const ticket = await this.findOne(id);

    const updated = await this.prismaService.ticket.update({
      where: { id },
      data: {
        ...dto,
        ...(dto.status === 'completed' && { completedAt: new Date() }),
        ...(dto.status === 'cancelled' && { cancelledAt: new Date() }),
      },
      include: {
        user: true,
        department: true,
        assignedToAdmin: {
          select: { id: true, fullName: true },
        },
      },
    });

    // Create history record
    await this.prismaService.ticketHistory.create({
      data: {
        ticketId: id,
        adminId,
        action: 'status_changed',
        oldValue: ticket.status,
        newValue: dto.status || ticket.status,
        comment: dto.comment,
        notifyUser: dto.notifyUser ?? true,
      },
    });

    return updated;
  }

  async findByLineUserId(lineUserId: string): Promise<any> {
    const user = await this.prismaService.user.findUnique({
      where: { lineUserId },
    });

    if (!user) {
      return [];
    }

    return this.prismaService.ticket.findMany({
      where: {
        userId: user.id,
        isDeleted: false,
      },
      include: {
        department: true,
        attachments: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  private async generateTicketNumber(): Promise<string> {
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');

    const lastTicket = await this.prismaService.ticket.findFirst({
      where: {
        ticketNumber: {
          startsWith: `REP-${dateStr}`,
        },
      },
      orderBy: { ticketNumber: 'desc' },
    });

    let sequence = 1;
    if (lastTicket) {
      const lastSequence = parseInt(lastTicket.ticketNumber.slice(-4));
      sequence = lastSequence + 1;
    }

    return `REP-${dateStr}-${sequence.toString().padStart(4, '0')}`;
  }
}
