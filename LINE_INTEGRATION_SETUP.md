# LINE Integration Setup Guide

## ✅ โค้ด Backend ที่สร้างแล้ว

### 1. Line Service (`src/modules/line/line.service.ts`)

- ✅ รับ Webhook events จาก LINE
- ✅ Verify signature จาก LINE (security)
- ✅ Handle text messages, follow, unfollow events
- ✅ Fetch user profile จาก LINE API
- ✅ Send messages กลับไปยัง user ผ่าน LINE Messaging API

### 2. Line Controller (`src/modules/line/line.controller.ts`)

- ✅ Endpoint: `POST /api/v1/line/webhook`
- ✅ Public (ไม่ต้อง JWT)
- ✅ Validate signature และ webhook format

### 3. Line Notify Service (`src/modules/notifications/line-notify.service.ts`)

- ✅ Send notifications เมื่อ ticket มีการเปลี่ยนแปลง
- ✅ Methods: notifyTicketCreated, notifyTicketUpdated, notifyTicketCompleted, notifyTicketCancelled

---

## 🚀 ขั้นตอนที่ต้องทำต่อ

### **Phase 1: ตั้งค่า LINE Official Account & Credentials**

#### 1.1 สร้าง LINE Official Account

```
1. ไป https://developers.line.biz/
2. Login ด้วย LINE account
3. Create new channel → Choose "LINE Official Account"
4. ตั้งค่า:
   - Channel name: "IT Repair System"
   - Category: Customer Service
   - Icon: เลือกไฟล์รูปภาพ
   - Description: "ระบบแจ้งซ่อม IT"
```

#### 1.2 ได้ Credentials

```
ไป Channel Settings → Messaging API → Copy:
- Channel Access Token    → ใส่ใน LINE_CHANNEL_ACCESS_TOKEN
- Channel Secret          → ใส่ใน LINE_CHANNEL_SECRET (จาก Basic settings)
```

#### 1.3 Setup Webhook URL

```
ใน Messaging API section:
- Webhook URL = https://api.your-domain.com/api/v1/line/webhook
- Use webhook = Enable ✓
- Auto-reply = Disable (ใช้ code ควบคุมเอง)
```

---

### **Phase 2: สร้าง LIFF App (ส่วน User Interface)**

#### 2.1 สร้าง LIFF Application

```
ใน LINE Developers Console:
1. Create new LIFF app
2. ตั้งค่า:
   - LIFF URL        = https://liff.your-domain.com/
   - LIFF size       = Full Page
   - Module          = Web API ✓
3. Copy LIFF ID → ใส่ใน LINE_LIFF_ID environment variable
```

#### 2.2 ตรวจสอบ Rich Menu (ถ้าต้อง)

```json
{
  "size": {
    "width": 2500,
    "height": 1686
  },
  "selected": true,
  "areas": [
    {
      "bounds": { "x": 0, "y": 0, "width": 1250, "height": 843 },
      "action": {
        "type": "uri",
        "uri": "line://liff/{LIFF_ID}",
        "label": "สร้าง Ticket"
      }
    },
    {
      "bounds": { "x": 1250, "y": 0, "width": 1250, "height": 843 },
      "action": {
        "type": "message",
        "text": "ดูสถานะของฉัน",
        "label": "ดูสถานะ"
      }
    }
  ]
}
```

---

### **Phase 3: ตั้งค่า Environment Variables**

#### 3.1 Update `.env` ไฟล์

```env
# LINE Integration
LINE_CHANNEL_ACCESS_TOKEN="xxxxxxxxxxxxxxx"
LINE_CHANNEL_SECRET="xxxxxxxxxxxxxxx"
LINE_LIFF_ID="1234567890-xxxxxxxx"

# Domain URLs (production)
API_URL="https://api.your-domain.com"
FRONTEND_URL="https://admin.your-domain.com"
LIFF_URL="https://liff.your-domain.com"
```

---

### **Phase 4: Integrate ใน Tickets Service**

เพื่อให้ notification ส่งไปให้ user โดยอัตโนมัติ ต้องเรียก LineNotifyService:

#### 4.1 Update `src/modules/tickets/tickets.service.ts`

```typescript
import { LineNotifyService } from '@modules/notifications/line-notify.service';

@Injectable()
export class TicketsService {
  constructor(
    private prisma: PrismaService,
    private lineNotify: LineNotifyService, // Add this
  ) {}

  async create(dto: CreateTicketDto): Promise<any> {
    // ... existing code ...

    // After ticket creation, notify user
    await this.lineNotify.notifyTicketCreated({
      lineUserId: user.lineUserId,
      title: 'Ticket Created',
      message: ticket.issueTitle,
      ticketNumber: ticket.ticketNumber,
      status: 'pending',
    });

    return ticket;
  }

  async update(
    id: string,
    dto: UpdateTicketDto,
    adminId: string,
  ): Promise<any> {
    // ... existing code ...

    // After update, notify user
    const user = await this.prisma.user.findUnique({
      where: { id: updatedTicket.userId },
    });

    if (user) {
      const action = dto.status ? 'updated' : 'commented';
      if (dto.status) {
        await this.lineNotify.notifyTicketUpdated({
          lineUserId: user.lineUserId,
          title: 'Ticket Updated',
          message: updatedTicket.issueTitle,
          ticketNumber: updatedTicket.ticketNumber,
          status: updatedTicket.status,
        });
      }
    }

    return updatedTicket;
  }
}
```

---

### **Phase 5: Testing**

#### 5.1 Test Webhook ผ่าน LINE Bot Designer

```
ใน LINE Developers Console:
1. Bot Designer → Scenario
2. Simulate webhook events
3. ดูว่า backend ได้รับ request หรือไม่
```

#### 5.2 Test Locally

```bash
# Install ngrok (expose local server to internet)
ngrok http 3000

# Update webhook URL ใน LINE Console
# https://abc123.ngrok.io/api/v1/line/webhook

# Test by sending message to bot in LINE app
# Check backend logs for webhook events
```

#### 5.3 Test Production

```bash
# 1. Build backend
npm run build

# 2. Start server
npm run start:prod

# 3. Test webhook
curl -X POST https://api.your-domain.com/api/v1/line/webhook \
  -H "Content-Type: application/json" \
  -H "x-line-signature: SIGNATURE_HERE" \
  -d '{
    "events": [
      {
        "type": "message",
        "source": { "userId": "test_user_id" },
        "message": { "type": "text", "text": "สวัสดี" }
      }
    ]
  }'
```

---

## 📋 Checklist ก่อน Deploy to Production

```
□ LINE Official Account สร้างแล้ว
□ ได้ Channel Access Token & Channel Secret
□ สร้าง LIFF App ได้ LIFF ID
□ Webhook URL ตั้งค่าใน LINE Console
□ Backend code compile & run ได้
□ Tested webhook locally with ngrok
□ Environment variables ตั้งค่าถูกต้อง
□ Database migrations ทำแล้ว
□ SSL/TLS certificates ตั้งค่า (HTTPS required)
□ Tested webhook in production environment
□ Tested creating ticket from LINE
□ Tested receiving notifications
□ Monitoring & logging setup
```

---

## 🔗 Useful Links

- LINE Developers: https://developers.line.biz/
- LINE Messaging API Docs: https://developers.line.biz/en/docs/messaging-api/
- LINE LIFF Docs: https://developers.line.biz/en/docs/liff/
- ngrok: https://ngrok.com/
