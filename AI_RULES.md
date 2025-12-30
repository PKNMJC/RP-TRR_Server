# AI Development Rules - IT Repair System

## 🎯 Project Overview

ระบบแจ้งซ่อมอุปกรณ์ IT ผ่าน LINE Official Account โดยผู้ใช้ไม่ต้องสมัครสมาชิกหรือ Login แต่ใช้ LINE User ID ในการ track การใช้งาน

### Tech Stack
- **Frontend**: Next.js 14+ (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: NestJS, TypeScript, Prisma ORM
- **Database**: MySQL 8.0+
- **Storage**: AWS S3 / Google Cloud Storage
- **Message Queue**: Bull + Redis
- **Real-time**: Socket.IO
- **LINE Integration**: LINE LIFF, LINE Messaging API, LINE Notify

---

## 🏗️ Architecture Principles

### 1. Monorepo Structure
```
project-root/
├── apps/
│   ├── web/              # Next.js Frontend (Admin Panel)
│   ├── liff/             # LINE LIFF App (User Interface)
│   └── api/              # NestJS Backend API
├── packages/
│   ├── database/         # Prisma Schema & Migrations
│   ├── types/            # Shared TypeScript Types
│   ├── ui/               # Shared UI Components
│   └── utils/            # Shared Utilities
├── docs/
│   ├── api/              # API Documentation
│   ├── deployment/       # Deployment Guides
│   └── user-guide/       # User Manuals
└── scripts/              # Build & Deploy Scripts
```

### 2. API Design Principles
- ✅ RESTful API with clear resource naming
- ✅ Versioned API (v1, v2) for backward compatibility
- ✅ Consistent response format
- ✅ Proper HTTP status codes
- ✅ Rate limiting on all endpoints
- ✅ Request/Response logging
- ✅ Error handling with detailed messages

### 3. Database Design
- ✅ Use UUIDs for all primary keys
- ✅ Soft delete for important data (tickets, users)
- ✅ Created/Updated timestamps on all tables
- ✅ Proper indexes for search fields
- ✅ Foreign key constraints
- ✅ Enum types for status fields

### 4. Security Requirements
- ✅ JWT authentication for Admin Panel
- ✅ LINE User ID validation via LINE API
- ✅ Rate limiting: 100 requests/hour per user
- ✅ File upload validation (type, size, virus scan)
- ✅ SQL injection prevention (Prisma ORM)
- ✅ XSS prevention on all inputs
- ✅ CORS properly configured
- ✅ Helmet.js for security headers
- ✅ Environment variables for secrets

### 5. LINE Integration Rules
- ✅ Always validate LINE User ID by calling LINE API
- ✅ Store LINE Profile data on first interaction
- ✅ Update profile data periodically
- ✅ Handle LINE webhook events properly
- ✅ Retry LINE Notify on failure (max 3 times)
- ✅ Use LINE LIFF for web views

---

## 📐 Code Standards

### Naming Conventions
```typescript
// Files & Folders
- kebab-case for files: user-service.ts, ticket-controller.ts
- PascalCase for components: TicketCard.tsx, DashboardLayout.tsx
- Folders: lowercase with dash

// Code
- camelCase for variables & functions: getUserTickets, ticketCount
- PascalCase for Classes & Interfaces: TicketService, UserInterface
- UPPER_SNAKE_CASE for constants: MAX_FILE_SIZE, API_BASE_URL
- Prefix interfaces with 'I': ITicket, IUser
- Prefix types with 'T': TStatus, TPriority
```

### TypeScript Rules
- ✅ Strict mode enabled
- ✅ No `any` type (use `unknown` if needed)
- ✅ Explicit return types for functions
- ✅ Use interfaces for objects, types for unions/primitives
- ✅ Use enums for status values
- ✅ Proper null/undefined handling

### Component Structure (React/Next.js)
```tsx
// 1. Imports - grouped and sorted
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import type { ITicket } from '@/types'

// 2. Types/Interfaces
interface TicketCardProps {
  ticket: ITicket
  onUpdate?: (id: string) => void
}

// 3. Component
export function TicketCard({ ticket, onUpdate }: TicketCardProps) {
  // a. Hooks
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  
  // b. Derived state
  const isUrgent = ticket.priority === 'critical'
  
  // c. Handlers
  const handleUpdate = async () => {
    // implementation
  }
  
  // d. Effects
  useEffect(() => {
    // side effects
  }, [])
  
  // e. Render
  return (
    // JSX
  )
}
```

### Backend Service Structure (NestJS)
```typescript
// ticket.service.ts
@Injectable()
export class TicketService {
  constructor(
    private prisma: PrismaService,
    private lineService: LineService,
    private notificationQueue: NotificationQueue,
  ) {}
  
  // Public methods first
  async createTicket(dto: CreateTicketDto): Promise<Ticket> {
    // Validate
    await this.validateUser(dto.lineUserId)
    
    // Business logic
    const ticket = await this.prisma.ticket.create({
      data: {
        ...dto,
        ticketNumber: this.generateTicketNumber(),
      },
    })
    
    // Side effects (queue, not await)
    await this.notificationQueue.add('ticket-created', { ticketId: ticket.id })
    
    return ticket
  }
  
  // Private helper methods last
  private generateTicketNumber(): string {
    // implementation
  }
}
```

---

## 🎨 UI/UX Guidelines

### Design System
- ✅ Use shadcn/ui components as base
- ✅ Consistent spacing: 4, 8, 16, 24, 32, 48, 64px
- ✅ Color palette from Tailwind
- ✅ Responsive: mobile-first design
- ✅ Accessibility: ARIA labels, keyboard navigation

### User Feedback
- ✅ Loading states for all async actions
- ✅ Toast notifications for success/error
- ✅ Confirmation dialogs for destructive actions
- ✅ Empty states with helpful messages
- ✅ Skeleton loaders for initial load

### LINE LIFF Specific
- ✅ Design for mobile screens (375px - 428px)
- ✅ Use LINE LIFF SDK properly
- ✅ Handle LIFF close() on form submit
- ✅ Show loading during LIFF init
- ✅ Graceful fallback if LIFF fails

---

## 🚀 Performance Optimization

### Frontend
- ✅ Next.js Image component for all images
- ✅ Dynamic imports for heavy components
- ✅ Memoization for expensive computations
- ✅ Debounce search inputs (300ms)
- ✅ Virtual scrolling for long lists
- ✅ Static generation where possible

### Backend
- ✅ Database connection pooling
- ✅ Redis caching for frequent queries
- ✅ Pagination on all list endpoints (default 25 items)
- ✅ Eager loading for relations
- ✅ Background jobs for heavy tasks
- ✅ Response compression

### Database
- ✅ Index on search fields: ticket_number, user_id, status
- ✅ Composite index on (created_at, status)
- ✅ Avoid N+1 queries
- ✅ Use database views for complex reports

---

## 🧪 Testing Requirements

### Unit Tests
- ✅ All services must have >80% coverage
- ✅ Test happy path + error cases
- ✅ Mock external dependencies (LINE API, S3)

### Integration Tests
- ✅ API endpoints with real database (test DB)
- ✅ Test authentication flow
- ✅ Test file upload

### E2E Tests (Playwright)
- ✅ Critical user flows: create ticket, view status
- ✅ Admin flows: update status, assign technician

---

## 📊 Monitoring & Logging

### Logging
```typescript
// Use structured logging
logger.info('Ticket created', {
  ticketId: ticket.id,
  userId: user.id,
  priority: ticket.priority,
})

// Log levels
- error: System failures, exceptions
- warn: Degraded performance, retries
- info: Business events (ticket created, status changed)
- debug: Detailed diagnostic info
```

### Metrics to Track
- ✅ API response times (p50, p95, p99)
- ✅ Database query times
- ✅ LINE API call success rate
- ✅ File upload success rate
- ✅ Active tickets count
- ✅ Average resolution time

---

## 🔄 Deployment & CI/CD

### Environments
- `development` - Local dev
- `staging` - Pre-production testing
- `production` - Live system

### Deployment Checklist
- ✅ Run migrations
- ✅ Update environment variables
- ✅ Build optimized production bundle
- ✅ Health check endpoint responsive
- ✅ Rollback plan ready

### Git Workflow
```
main (production)
  └── develop (staging)
      └── feature/ticket-123-add-priority-filter
      └── fix/ticket-124-image-upload-bug
```

### Commit Message Format
```
feat(tickets): add priority filter to list page
fix(upload): handle large image files properly
docs(api): update swagger documentation
chore(deps): upgrade prisma to 5.0
```

---

## 🔐 Environment Variables

### Required Variables
```env
# Database
DATABASE_URL="mysql://user:pass@host:3306/db"

# LINE
LINE_CHANNEL_ACCESS_TOKEN="your_token"
LINE_CHANNEL_SECRET="your_secret"
LINE_LIFF_ID="your_liff_id"
LINE_NOTIFY_TOKEN="your_notify_token"

# AWS S3
AWS_ACCESS_KEY_ID="your_key"
AWS_SECRET_ACCESS_KEY="your_secret"
AWS_S3_BUCKET="your_bucket"
AWS_REGION="ap-southeast-1"

# JWT
JWT_SECRET="your_secret"
JWT_EXPIRES_IN="7d"

# Redis
REDIS_URL="redis://localhost:6379"

# App
FRONTEND_URL="https://admin.example.com"
LIFF_URL="https://liff.example.com"
API_URL="https://api.example.com"
```

---

## 📚 Documentation Requirements

### Code Comments
- ✅ JSDoc for public functions/methods
- ✅ Explain complex business logic
- ✅ Document why, not what (code shows what)

### API Documentation
- ✅ Swagger/OpenAPI for all endpoints
- ✅ Request/Response examples
- ✅ Error codes explained

### README Files
- ✅ Each app/package has README
- ✅ Setup instructions
- ✅ Environment variables explained
- ✅ Common issues & solutions

---

## 🚨 Error Handling

### API Error Format
```typescript
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid ticket data",
    "details": [
      {
        "field": "priority",
        "message": "Priority must be one of: normal, urgent, critical"
      }
    ]
  },
  "timestamp": "2024-12-30T10:30:00Z"
}
```

### Error Codes
- `VALIDATION_ERROR` - Input validation failed
- `NOT_FOUND` - Resource not found
- `UNAUTHORIZED` - Authentication required
- `FORBIDDEN` - Insufficient permissions
- `RATE_LIMIT_EXCEEDED` - Too many requests
- `INTERNAL_ERROR` - Server error
- `EXTERNAL_SERVICE_ERROR` - LINE API / S3 failed

---

## 🎯 Best Practices Summary

### DO ✅
- Write self-documenting code
- Handle errors gracefully
- Validate all inputs
- Use TypeScript strict mode
- Write tests for critical paths
- Log important events
- Use environment variables for config
- Keep functions small and focused
- Use async/await, not callbacks
- Comment complex business logic

### DON'T ❌
- Use `any` type
- Store secrets in code
- Skip error handling
- Ignore TypeScript errors
- Mix business logic with presentation
- Use console.log in production
- Hard-code configuration
- Write functions >50 lines
- Ignore security best practices
- Skip code reviews

---

## 📞 Support & Resources

### Documentation Links
- Next.js: https://nextjs.org/docs
- NestJS: https://docs.nestjs.com
- Prisma: https://www.prisma.io/docs
- LINE Developers: https://developers.line.biz
- Tailwind: https://tailwindcss.com/docs

### Team Contacts
- Tech Lead: [email]
- DevOps: [email]
- LINE API Support: [email]

---

**Last Updated**: 2024-12-30
**Version**: 1.0.0