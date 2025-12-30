# Backend Development Prompt - NestJS API

## 🎯 Your Role
You are a senior NestJS backend developer building a professional IT repair ticketing system API. Follow enterprise-level best practices and create production-ready code.

---

## 🏗️ Project Structure

```
apps/api/
├── src/
│   ├── main.ts                    # Application entry point
│   ├── app.module.ts              # Root module
│   │
│   ├── config/                    # Configuration
│   │   ├── database.config.ts
│   │   ├── line.config.ts
│   │   ├── aws.config.ts
│   │   └── redis.config.ts
│   │
│   ├── common/                    # Shared utilities
│   │   ├── decorators/
│   │   │   ├── current-user.decorator.ts
│   │   │   └── public.decorator.ts
│   │   ├── filters/
│   │   │   └── http-exception.filter.ts
│   │   ├── guards/
│   │   │   ├── jwt-auth.guard.ts
│   │   │   └── roles.guard.ts
│   │   ├── interceptors/
│   │   │   ├── logging.interceptor.ts
│   │   │   └── transform.interceptor.ts
│   │   ├── pipes/
│   │   │   └── validation.pipe.ts
│   │   └── interfaces/
│   │       └── response.interface.ts
│   │
│   ├── modules/
│   │   ├── auth/                  # Authentication
│   │   │   ├── auth.module.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.controller.ts
│   │   │   ├── strategies/
│   │   │   │   ├── jwt.strategy.ts
│   │   │   │   └── local.strategy.ts
│   │   │   └── dto/
│   │   │       ├── login.dto.ts
│   │   │       └── register.dto.ts
│   │   │
│   │   ├── users/                 # LINE Users
│   │   │   ├── users.module.ts
│   │   │   ├── users.service.ts
│   │   │   ├── users.controller.ts
│   │   │   ├── dto/
│   │   │   │   └── create-user.dto.ts
│   │   │   └── entities/
│   │   │       └── user.entity.ts
│   │   │
│   │   ├── tickets/               # Tickets (Main module)
│   │   │   ├── tickets.module.ts
│   │   │   ├── tickets.service.ts
│   │   │   ├── tickets.controller.ts
│   │   │   ├── dto/
│   │   │   │   ├── create-ticket.dto.ts
│   │   │   │   ├── update-ticket.dto.ts
│   │   │   │   ├── query-ticket.dto.ts
│   │   │   │   └── assign-ticket.dto.ts
│   │   │   └── entities/
│   │   │       └── ticket.entity.ts
│   │   │
│   │   ├── attachments/           # File uploads
│   │   │   ├── attachments.module.ts
│   │   │   ├── attachments.service.ts
│   │   │   └── dto/
│   │   │       └── upload-file.dto.ts
│   │   │
│   │   ├── departments/           # Departments
│   │   │   ├── departments.module.ts
│   │   │   ├── departments.service.ts
│   │   │   └── departments.controller.ts
│   │   │
│   │   ├── admins/                # Admin users
│   │   │   ├── admins.module.ts
│   │   │   ├── admins.service.ts
│   │   │   └── admins.controller.ts
│   │   │
│   │   ├── line/                  # LINE integration
│   │   │   ├── line.module.ts
│   │   │   ├── line.service.ts
│   │   │   ├── line.controller.ts  # Webhook handler
│   │   │   └── dto/
│   │   │       └── line-webhook.dto.ts
│   │   │
│   │   ├── notifications/         # Notification queue
│   │   │   ├── notifications.module.ts
│   │   │   ├── notifications.service.ts
│   │   │   ├── notifications.processor.ts
│   │   │   └── dto/
│   │   │       └── send-notification.dto.ts
│   │   │
│   │   ├── websocket/             # Real-time updates
│   │   │   ├── websocket.module.ts
│   │   │   ├── websocket.gateway.ts
│   │   │   └── dto/
│   │   │       └── ticket-update.dto.ts
│   │   │
│   │   └── analytics/             # Dashboard stats
│   │       ├── analytics.module.ts
│   │       ├── analytics.service.ts
│   │       └── analytics.controller.ts
│   │
│   └── database/                  # Database module
│       ├── database.module.ts
│       └── prisma.service.ts
│
├── prisma/
│   ├── schema.prisma              # Prisma schema
│   ├── migrations/                # Database migrations
│   └── seed.ts                    # Seed data
│
├── test/
│   ├── unit/
│   └── e2e/
│
├── .env.example
├── nest-cli.json
├── package.json
├── tsconfig.json
└── README.md
```

---

## 📋 Implementation Checklist

### Phase 1: Setup & Core Infrastructure
- [ ] Initialize NestJS project with TypeScript strict mode
- [ ] Setup Prisma with MySQL connection
- [ ] Create database schema with all tables
- [ ] Setup environment configuration (@nestjs/config)
- [ ] Implement global exception filter
- [ ] Implement validation pipe (class-validator)
- [ ] Setup logging (Winston or Pino)
- [ ] Setup Swagger documentation

### Phase 2: Authentication & Authorization
- [ ] Implement JWT authentication
- [ ] Create JwtAuthGuard
- [ ] Create RolesGuard (super_admin, admin, viewer)
- [ ] Hash passwords with bcrypt
- [ ] Implement refresh token
- [ ] Add rate limiting (ThrottlerModule)
- [ ] Implement 2FA for super admin (optional)

### Phase 3: LINE Integration
- [ ] Validate LINE User ID with LINE API
- [ ] Handle LINE webhook events
- [ ] Implement LINE Messaging API client
- [ ] Implement LINE Notify integration
- [ ] Create LIFF endpoint authentication
- [ ] Handle LINE profile updates

### Phase 4: Ticket Management
- [ ] Create ticket CRUD operations
- [ ] Implement ticket number generation
- [ ] Add filtering & search functionality
- [ ] Implement pagination
- [ ] Add ticket assignment logic
- [ ] Implement status updates with history
- [ ] Add comment system

### Phase 5: File Upload
- [ ] Setup AWS S3 client
- [ ] Implement image upload with validation
- [ ] Resize and optimize images (sharp)
- [ ] Generate pre-signed URLs
- [ ] Handle multiple file uploads (max 3)

### Phase 6: Notification System
- [ ] Setup Bull queue with Redis
- [ ] Create notification processor
- [ ] Implement retry logic (max 3 attempts)
- [ ] Send LINE notifications
- [ ] Send email notifications (backup)
- [ ] Track notification status

### Phase 7: Real-time Features
- [ ] Setup Socket.IO gateway
- [ ] Emit ticket updates to admin dashboard
- [ ] Handle client connections
- [ ] Implement room-based broadcasting

### Phase 8: Analytics & Reports
- [ ] Create dashboard statistics endpoint
- [ ] Calculate ticket metrics
- [ ] Generate time-series data
- [ ] Export functionality (CSV)

---

## 🎯 Critical Implementation Rules

### 1. Request/Response Format

**Standard Success Response**
```typescript
export interface ApiResponse<T> {
  success: true
  data: T
  meta?: {
    total?: number
    page?: number
    limit?: number
    hasMore?: boolean
  }
  timestamp: string
}

// Usage
return {
  success: true,
  data: ticket,
  timestamp: new Date().toISOString(),
}
```

**Standard Error Response**
```typescript
export interface ApiErrorResponse {
  success: false
  error: {
    code: string
    message: string
    details?: any[]
  }
  timestamp: string
}

// Usage in exception filter
throw new BadRequestException({
  code: 'VALIDATION_ERROR',
  message: 'Invalid input data',
  details: errors,
})
```

### 2. DTO Validation Examples

```typescript
// create-ticket.dto.ts
import { IsString, IsNotEmpty, IsEnum, IsOptional, Length, Matches } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export enum TicketPriority {
  NORMAL = 'normal',
  URGENT = 'urgent',
  CRITICAL = 'critical',
}

export enum TicketCategory {
  HARDWARE = 'hardware',
  SOFTWARE = 'software',
  NETWORK = 'network',
  PERIPHERAL = 'peripheral',
  EMAIL = 'email',
  ACCOUNT = 'account',
  OTHER = 'other',
}

export class CreateTicketDto {
  @ApiProperty({ example: 'U1234567890abcdef' })
  @IsString()
  @IsNotEmpty()
  lineUserId: string

  @ApiProperty({ example: 'ปอนด์' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 50)
  nickname: string

  @ApiProperty({ example: 'uuid-of-department' })
  @IsString()
  @IsNotEmpty()
  departmentId: string

  @ApiProperty({ example: '0812345678', required: false })
  @IsOptional()
  @IsString()
  @Matches(/^[0-9]{10}$|^[0-9]{3}-[0-9]{3}-[0-9]{4}$/, {
    message: 'Phone number must be 10 digits or format: 081-234-5678',
  })
  phone?: string

  @ApiProperty({ example: 'อาคาร A' })
  @IsString()
  @IsNotEmpty()
  locationBuilding: string

  @ApiProperty({ example: 'ชั้น 2' })
  @IsString()
  @IsNotEmpty()
  locationFloor: string

  @ApiProperty({ example: 'ห้อง 201' })
  @IsString()
  @IsNotEmpty()
  locationRoom: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  locationDetail?: string

  @ApiProperty({ enum: TicketCategory })
  @IsEnum(TicketCategory)
  category: TicketCategory

  @ApiProperty({ example: 'คอมพิวเตอร์เปิดไม่ติด' })
  @IsString()
  @IsNotEmpty()
  @Length(10, 100)
  issueTitle: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @Length(0, 500)
  issueDescription?: string

  @ApiProperty({ enum: TicketPriority, default: TicketPriority.NORMAL })
  @IsEnum(TicketPriority)
  priority: TicketPriority = TicketPriority.NORMAL
}
```

### 3. Service Example - Tickets Service

```typescript
// tickets.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { PrismaService } from '../database/prisma.service'
import { CreateTicketDto, UpdateTicketDto, QueryTicketDto } from './dto'
import { LineService } from '../line/line.service'
import { NotificationsService } from '../notifications/notifications.service'
import { WebSocketGateway } from '../websocket/websocket.gateway'

@Injectable()
export class TicketsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly lineService: LineService,
    private readonly notifications: NotificationsService,
    private readonly wsGateway: WebSocketGateway,
  ) {}

  async create(dto: CreateTicketDto, files?: Express.Multer.File[]) {
    // 1. Validate LINE User
    const lineProfile = await this.lineService.getProfile(dto.lineUserId)
    if (!lineProfile) {
      throw new BadRequestException('Invalid LINE User ID')
    }

    // 2. Get or create user
    let user = await this.prisma.user.findUnique({
      where: { lineUserId: dto.lineUserId },
    })

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          lineUserId: dto.lineUserId,
          displayName: lineProfile.displayName,
          pictureUrl: lineProfile.pictureUrl,
          firstSeenAt: new Date(),
          lastSeenAt: new Date(),
          ticketCount: 0,
        },
      })
    } else {
      await this.prisma.user.update({
        where: { id: user.id },
        data: { lastSeenAt: new Date() },
      })
    }

    // 3. Generate ticket number
    const ticketNumber = await this.generateTicketNumber()

    // 4. Create ticket
    const ticket = await this.prisma.ticket.create({
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
    })

    // 5. Upload files if any
    if (files && files.length > 0) {
      // Upload to S3 and create attachment records
      // (implement in AttachmentsService)
    }

    // 6. Create history record
    await this.prisma.ticketHistory.create({
      data: {
        ticketId: ticket.id,
        action: 'created',
        comment: 'Ticket created',
      },
    })

    // 7. Update user ticket count
    await this.prisma.user.update({
      where: { id: user.id },
      data: { ticketCount: { increment: 1 } },
    })

    // 8. Queue notifications (don't await)
    this.notifications.queueTicketCreated(ticket).catch(err => {
      console.error('Failed to queue notification:', err)
    })

    // 9. Emit WebSocket event
    this.wsGateway.emitTicketCreated(ticket)

    return ticket
  }

  async findAll(query: QueryTicketDto) {
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
    } = query

    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {
      isDeleted: false,
    }

    if (status) where.status = status
    if (category) where.category = category
    if (priority) where.priority = priority
    if (departmentId) where.departmentId = departmentId
    if (assignedTo) where.assignedTo = assignedTo

    if (search) {
      where.OR = [
        { ticketNumber: { contains: search } },
        { nickname: { contains: search } },
        { issueTitle: { contains: search } },
      ]
    }

    if (startDate || endDate) {
      where.createdAt = {}
      if (startDate) where.createdAt.gte = new Date(startDate)
      if (endDate) where.createdAt.lte = new Date(endDate)
    }

    // Execute query
    const [tickets, total] = await Promise.all([
      this.prisma.ticket.findMany({
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
      this.prisma.ticket.count({ where }),
    ])

    return {
      data: tickets,
      meta: {
        total,
        page,
        limit,
        hasMore: skip + tickets.length < total,
      },
    }
  }

  async findOne(id: string) {
    const ticket = await this.prisma.ticket.findFirst({
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
    })

    if (!ticket) {
      throw new NotFoundException('Ticket not found')
    }

    return ticket
  }

  async update(id: string, dto: UpdateTicketDto, adminId: string) {
    const ticket = await this.findOne(id)

    const updated = await this.prisma.ticket.update({
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
    })

    // Create history record
    await this.prisma.ticketHistory.create({
      data: {
        ticketId: id,
        adminId,
        action: 'status_changed',
        oldValue: ticket.status,
        newValue: dto.status,
        comment: dto.comment,
        notifyUser: dto.notifyUser ?? true,
      },
    })

    // Queue notification if requested
    if (dto.notifyUser) {
      this.notifications.queueTicketUpdated(updated).catch(err => {
        console.error('Failed to queue notification:', err)
      })
    }

    // Emit WebSocket event
    this.wsGateway.emitTicketUpdated(updated)

    return updated
  }

  private async generateTicketNumber(): Promise<string> {
    const now = new Date()
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '')

    const lastTicket = await this.prisma.ticket.findFirst({
      where: {
        ticketNumber: {
          startsWith: `REP-${dateStr}`,
        },
      },
      orderBy: { ticketNumber: 'desc' },
    })

    let sequence = 1
    if (lastTicket) {
      const lastSequence = parseInt(lastTicket.ticketNumber.slice(-4))
      sequence = lastSequence + 1
    }

    return `REP-${dateStr}-${sequence.toString().padStart(4, '0')}`
  }
}
```

### 4. Controller Example

```typescript
// tickets.controller.ts
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common'
import { FilesInterceptor } from '@nestjs/platform-express'
import { ApiBearerAuth, ApiTags, ApiConsumes } from '@nestjs/swagger'
import { TicketsService } from './tickets.service'
import { CreateTicketDto, UpdateTicketDto, QueryTicketDto } from './dto'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { RolesGuard } from '../auth/guards/roles.guard'
import { Roles } from '../auth/decorators/roles.decorator'
import { Public } from '../common/decorators/public.decorator'
import { CurrentUser } from '../common/decorators/current-user.decorator'

@ApiTags('tickets')
@Controller('api/v1/tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Public() // Allow LIFF to call without auth
  @Post()
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FilesInterceptor('files', 3)) // Max 3 files
  async create(
    @Body() dto: CreateTicketDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    const ticket = await this.ticketsService.create(dto, files)
    return {
      success: true,
      data: ticket,
      timestamp: new Date().toISOString(),
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'super_admin', 'viewer')
  @ApiBearerAuth()
  @Get()
  async findAll(@Query() query: QueryTicketDto) {
    const result = await this.ticketsService.findAll(query)
    return {
      success: true,
      ...result,
      timestamp: new Date().toISOString(),
    }
  }

  @Public() // Allow users to view their own tickets
  @Get('user/:lineUserId')
  async findByUser(@Param('lineUserId') lineUserId: string) {
    const tickets = await this.ticketsService.findByLineUserId(lineUserId)
    return {
      success: true,
      data: tickets,
      timestamp: new Date().toISOString(),
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'super_admin', 'viewer')
  @ApiBearerAuth()
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const ticket = await this.ticketsService.findOne(id)
    return {
      success: true,
      data: ticket,
      timestamp: new Date().toISOString(),
    }
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
    const ticket = await this.ticketsService.update(id, dto, user.id)
    return {
      success: true,
      data: ticket,
      timestamp: new Date().toISOString(),
    }
  }
}
```

---

## 🔐 Security Implementations

### 1. JWT Strategy
```typescript
// jwt.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { ConfigService } from '@nestjs/config'
import { PrismaService } from '../../database/prisma.service'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private config: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get('JWT_SECRET'),
    })
  }

  async validate(payload: any) {
    const admin = await this.prisma.admin.findUnique({
      where: { id: payload.sub, isActive: true },
      select: {
        id: true,
        email: true,
        username: true,
        fullName: true,
        role: true,
      },
    })

    if (!admin) {
      throw new UnauthorizedException()
    }

    return admin
  }
}
```

### 2. Rate Limiting
```typescript
// main.ts
import { ThrottlerModule } from '@nestjs/throttler'

@Module({
  imports: [
    ThrottlerModule.forRoot({
      ttl: 60, // 60 seconds
      limit: 100, // 100 requests
    }),
  ],
})
```

---

## 📊 Prisma Schema (Key Parts)

```prisma
// schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

model User {
  id          String   @id @default(uuid())
  lineUserId  String   @unique @map("line_user_id")
  displayName String   @map("display_name")
  pictureUrl  String?  @map("picture_url")
  firstSeenAt DateTime @map("first_seen_at")
  lastSeenAt  DateTime @map("last_seen_at")
  ticketCount Int      @default(0) @map("ticket_count")
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  tickets Ticket[]

  @@map("users")
}

model Ticket {
  id               String   @id @default(uuid())
  ticketNumber     String   @unique @map("ticket_number")
  userId           String   @map("user_id")
  nickname         String
  departmentId     String   @map("department_id")
  phone            String?
  locationBuilding String   @map("location_building")
  locationFloor    String   @map("location_floor")
  locationRoom     String   @map("location_room")
  locationDetail   String?  @map("location_detail")
  category         String
  issueTitle       String   @map("issue_title")
  issueDescription String?  @db.Text @map("issue_description")
  priority         String   @default("normal")
  status           String   @default("pending")
  assignedTo       String?  @map("assigned_to")
  assignedAt       DateTime? @map("assigned_at")
  completedAt      DateTime? @map("completed_at")
  cancelledAt      DateTime? @map("cancelled_at")
  cancellationReason String? @map("cancellation_reason")
  isDeleted        Boolean  @default(false) @map("is_deleted")
  createdAt        DateTime @default(now()) @map("created_at")
  updatedAt        DateTime @updatedAt @map("updated_at")
  deletedAt        DateTime? @map("deleted_at")

  user             User              @relation(fields: [userId], references: [id])
  department       Department        @relation(fields: [departmentId], references: [id])
  assignedToAdmin  Admin?            @relation(fields: [assignedTo], references: [id])
  attachments      Attachment[]
  history          TicketHistory[]

  @@index([userId])
  @@index([status])
  @@index([createdAt, status])
  @@index([ticketNumber])
  @@map("tickets")
}

// ... other models
```

---

## ✅ Testing Examples

```typescript
// tickets.service.spec.ts
describe('TicketsService', () => {
  let service: TicketsService
  let prisma: PrismaService

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        TicketsService,
        {
          provide: PrismaService,
          useValue: {
            ticket: {
              create: jest.fn(),
              findMany: jest.fn(),
              findFirst: jest.fn(),
            },
          },
        },
      ],
    }).compile()

    service = module.get<TicketsService>(TicketsService)
    prisma = module.get<PrismaService>(PrismaService)
  })

  describe('create', () => {
    it('should create a ticket successfully', async () => {
      const dto = {
        lineUserId: 'U1234567890',
        nickname: 'ปอนด์',
        // ... other fields
      }

      jest.spyOn(prisma.ticket, 'create').mockResolvedValue({
        id: 'ticket-id',
        ticketNumber: 'REP-20241230-0001',
        // ...
      } as any)

      const result = await service.create(dto)

      expect(result.ticketNumber).toBe('REP-20241230-0001')
      expect(prisma.ticket.create).toHaveBeenCalled()
    })
  })
})
```

---

## 🚀 Key Commands

```bash
# Development
npm run start:dev

# Build
npm run build

# Run migrations
npx prisma migrate dev

# Generate Prisma client
npx prisma generate

# Seed database
npx prisma db seed

# Run tests
npm run test
npm run test:e2e
npm run test:cov
```

---

**Always follow these principles:**
- ✅ Write type-safe code with TypeScript
- ✅ Use Prisma for all database operations
- ✅ Implement proper error handling
- ✅ Add validation to all DTOs
- ✅ Log important events
- ✅ Use async/await consistently
- ✅ Write tests for critical functions
- ✅ Document complex business logic
- ✅ Follow NestJS best practices
- ✅ Keep services focused and small