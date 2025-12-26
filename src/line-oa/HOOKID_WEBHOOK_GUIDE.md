# 🎣 HOOKID Webhook Integration Guide

## 概述 (Overview)

ระบบตรงทดแทนการใช้ LINE Bot SDK โดยตรง แต่เปลี่ยนเป็นการใช้ **Hookid** เป็นตัวกลาง (Webhook Gateway) ในการรับและส่งข้อความจาก LINE

### 🏗️ Architecture Pattern

```
┌─────────┐         ┌─────────┐         ┌─────────────┐
│   LINE  │ ──────> │ HOOKID  │ ──────> │   Backend   │
│   OA    │         │ Gateway │         │   API       │
└─────────┘         └─────────┘         └─────────────┘
                                              │
                                              ├─> Process Event (Async)
                                              │   - Create Ticket
                                              │   - Send LINE Notification
                                              │   - Save to DB
                                              │
                                              └─> Return Status (200 OK Immediately)
```

---

## 📝 API Endpoints

### 1️⃣ Receive Hookid Events (Webhook Callback)

**Endpoint:** `POST /api/line-oa/hookid/events`

**Pattern:** Immediate Response (200 OK) + Async Processing

**Request Body:**
```json
{
  "eventId": "hookid_20251226_abc123",
  "type": "message|postback|follow|unfollow",
  "userId": "U1234567890abc",
  "timestamp": 1704067200,
  "data": {
    "message": "สอบถามเรื่องแจ้งซ่อมไทย",
    "postbackData": "action=inquiry",
    "linkToken": "hookid_token_xxx"
  }
}
```

**Response (Immediate):**
```json
{
  "status": "received",
  "message": "Event received. Processing...",
  "referenceId": "hookid_20251226_abc123_1704067200"
}
```

**Processing (Background - Async):**
- ✅ บันทึก event ลง DB (HookidEvent table)
- ✅ จัดการข้อความตามประเภท event
  - `message`: สร้าง Ticket ใหม่
  - `postback`: ดึง Ticket status
  - `follow`: ส่ง Welcome message
  - `unfollow`: ยกเลิก link
- ✅ ส่ง LINE notification
- ✅ บันทึกผลลัพธ์

---

### 2️⃣ Check Event Processing Status

**Endpoint:** `GET /api/line-oa/hookid/status?referenceId=<reference_id>`

**Response:**
```json
{
  "eventId": "hookid_20251226_abc123",
  "referenceId": "TK20251226ABC12",
  "status": "processed|pending|error",
  "processedAt": "2025-12-26T14:00:00Z",
  "errorMessage": null,
  "retryCount": 0
}
```

---

## 🔧 Environment Variables

เพิ่มใน `.env` ของ backend:

```bash
# Hookid Configuration
HOOKID_SECRET=your_hookid_secret_key
HOOKID_CALLBACK_URL=https://hookid.example.com/webhook/callback

# LINE Configuration (ยังคงใช้งาน)
LINE_CHANNEL_SECRET=your_line_channel_secret
LINE_ACCESS_TOKEN=your_line_access_token

# Frontend URL (สำหรับ linking prompt)
FRONTEND_URL=https://yourapp.com
```

---

## 📊 Database Schema

### HookidEvent Model
```prisma
model HookidEvent {
  id          Int                @id @default(autoincrement())
  eventId     String             @unique
  type        String             // message, postback, etc.
  lineUserId  String
  timestamp   BigInt
  status      HookidEventStatus  // PENDING, PROCESSING, PROCESSED, FAILED
  referenceId String?            // Link to ticket/loan
  
  payload     String             @db.Text // JSON
  processedAt DateTime?
  errorMessage String?
  retryCount  Int                @default(0)
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@index([lineUserId])
  @@index([status])
  @@index([eventId])
}

enum HookidEventStatus {
  PENDING
  PROCESSING
  PROCESSED
  FAILED
}
```

---

## 🔄 Event Flow Examples

### Example 1: Message Event (Create Ticket)

```
1. LINE User: "สอบถามเรื่องแจ้งซ่อมไทย"
   ↓
2. Hookid receives → sends to Backend
   POST /api/line-oa/hookid/events
   {
     "eventId": "ev_001",
     "type": "message",
     "userId": "U1234567890",
     "data": { "message": "สอบถามเรื่องแจ้งซ่อมไทย" }
   }
   
3. Backend responds immediately (200 OK):
   {
     "status": "received",
     "referenceId": "hookid_ev_001_xyz"
   }
   
4. Backend (Async):
   - Find LINE link → User ID
   - Create Ticket (TK20251226ABC12)
   - Send LINE message:
     "✅ รับแจ้งซ่อมเรียบร้อย\nเลขที่: TK20251226ABC12\n..."
   - Update HookidEvent status to PROCESSED
   - Call Hookid callback (optional)
```

### Example 2: Postback Event (Check Status)

```
1. LINE User: Click "สอบถามสถานะ" button
   ↓
2. Hookid sends:
   POST /api/line-oa/hookid/events
   {
     "eventId": "ev_002",
     "type": "postback",
     "userId": "U1234567890",
     "data": { "postbackData": "action=status_inquiry" }
   }
   
3. Backend responds (200 OK)
   
4. Backend (Async):
   - Find latest ticket
   - Send status via LINE
     "📌 สถานะล่าสุด\nเลขที่: TK20251226ABC12\nสถานะ: IN_PROGRESS"
```

---

## ✅ Implementation Checklist

- [x] Create HookidEvent model in Prisma schema
- [x] Create HookidWebhookService
- [x] Create POST /api/line-oa/hookid/events endpoint
- [x] Create GET /api/line-oa/hookid/status endpoint
- [x] Handle message events (create ticket)
- [x] Handle postback events (check status)
- [x] Handle follow/unfollow events
- [x] Send LINE notifications
- [x] Database migration
- [ ] Hookid account setup & configuration
- [ ] Test with Hookid sandbox
- [ ] Production deployment

---

## 🚀 Deployment Steps

### 1. Update Vercel Environment Variables

```bash
HOOKID_SECRET=<your_secret>
HOOKID_CALLBACK_URL=https://api.yourapp.com/api/line-oa/hookid/callback
LINE_CHANNEL_SECRET=<your_secret>
LINE_ACCESS_TOKEN=<your_token>
FRONTEND_URL=https://yourapp.com
```

### 2. Run Database Migration

```bash
npm run prisma:migrate
```

### 3. Hookid Configuration

- Login to Hookid Dashboard
- Create new webhook integration
- Set webhook URL: `https://api.yourapp.com/api/line-oa/hookid/events`
- Set callback URL: `https://api.yourapp.com/api/line-oa/hookid/callback`
- Enable LINE integration
- Configure secret key
- Test with sandbox

### 4. Test Endpoints

```bash
# Test webhook
curl -X POST http://localhost:3000/api/line-oa/hookid/events \
  -H "Content-Type: application/json" \
  -d '{
    "eventId": "test_001",
    "type": "message",
    "userId": "U1234567890",
    "timestamp": 1704067200,
    "data": { "message": "Test message" }
  }'

# Check status
curl http://localhost:3000/api/line-oa/hookid/status?referenceId=test_001
```

---

## 🔐 Security Considerations

1. **Webhook Signature Validation** (Optional)
   - Hookid sends `x-hookid-signature` header
   - Verify HMAC SHA256

2. **Rate Limiting**
   - Implement per-user rate limiting
   - Prevent spam creation

3. **Data Validation**
   - Validate all input fields
   - Sanitize message content

4. **Error Handling**
   - Log all errors to database
   - Implement retry mechanism (up to 3 retries)
   - Send error notification to admin

---

## 📈 Monitoring & Logging

### Check Event Status

```bash
# Get pending events
SELECT * FROM "HookidEvent" WHERE status = 'PENDING' ORDER BY "createdAt" DESC;

# Get failed events
SELECT * FROM "HookidEvent" WHERE status = 'FAILED' ORDER BY "createdAt" DESC;

# Get success rate
SELECT 
  status, 
  COUNT(*) as count 
FROM "HookidEvent" 
WHERE "createdAt" > NOW() - INTERVAL '24 hours'
GROUP BY status;
```

### Enable Debug Logging

```typescript
// In HookidWebhookService
private readonly logger = new Logger(HookidWebhookService.name);

// Log format
this.logger.log(`[Hookid] Event processed: ${referenceId}`);
this.logger.error(`[Hookid] Error: ${error.message}`);
```

---

## 🆘 Troubleshooting

### Issue: "No linked user found"
**Solution:** User needs to link their LINE account first
```
User → Click "Link LINE" → Scan QR → Verify → Linked ✅
```

### Issue: "Event processing timeout"
**Solution:** Increase async timeout in main.ts
```typescript
// main.ts
const app = await NestFactory.create(AppModule, {
  bodyParser: false,
});
app.use(express.json({ limit: '10mb' }));
```

### Issue: "Hookid callback fails"
**Solution:** Check callback URL and secret in .env
```bash
HOOKID_CALLBACK_URL=https://api.yourapp.com/api/line-oa/hookid/callback
HOOKID_SECRET=your_secret_key
```

---

## 📚 Related Files

- [hookid-webhook.service.ts](./hookid-webhook.service.ts)
- [line-oa.controller.ts](./line-oa.controller.ts) - `/api/line-oa/hookid/events` endpoint
- [schema.prisma](../prisma/schema.prisma) - HookidEvent model
- [hookid.dto.ts](./dto/hookid.dto.ts) - Data transfer objects

---

## 🎯 Future Enhancements

1. **Implement Queue System** (Bull/RabbitMQ)
   - For better async handling
   - Retry logic with exponential backoff

2. **Add Flex Messages**
   - Rich UI for ticket display
   - Interactive buttons

3. **Enable AI Classification**
   - Auto-categorize problems
   - Suggest priority level

4. **Notification Scheduling**
   - Send status updates at scheduled times
   - Avoid overwhelming users

---

**Last Updated:** 2025-12-26  
**Status:** ✅ Ready for Implementation
