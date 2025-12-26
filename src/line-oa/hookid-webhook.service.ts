import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as line from '@line/bot-sdk';

export interface HookidPayload {
  eventId: string;
  type: 'message' | 'postback' | 'follow' | 'unfollow';
  userId: string;
  timestamp: number;
  data: {
    message?: string;
    postbackData?: string;
    linkToken?: string;
  };
}

export interface WebhookResponse {
  status: 'received' | 'processed' | 'error';
  message: string;
  referenceId: string;
}

@Injectable()
export class HookidWebhookService {
  private readonly logger = new Logger(HookidWebhookService.name);
  private readonly hookidSecret = process.env.HOOKID_SECRET || '';
  private readonly lineClient: line.Client;

  constructor(private readonly prisma: PrismaService) {
    // Initialize LINE Bot SDK Client
    this.lineClient = new line.Client({
      channelSecret: process.env.LINE_CHANNEL_SECRET || '',
      channelAccessToken: process.env.LINE_ACCESS_TOKEN || '',
    });
  }

  /**
   * ประมวลผล Hookid Webhook Event
   * ตอบกลับ 200 OK ทันที แล้วประมวลผลแบบ async
   */
  async handleWebhook(payload: HookidPayload): Promise<WebhookResponse> {
    try {
      // Validate hookid request
      if (!payload.eventId || !payload.userId) {
        throw new BadRequestException('Missing required fields');
      }

      // สร้าง reference ID สำหรับ track event นี้
      const referenceId = `hookid_${payload.eventId}_${Date.now()}`;

      this.logger.log(
        `[Hookid] Received event: ${payload.eventId} from user: ${payload.userId}`,
      );

      // บันทึก event ลง database
      await this.prisma.hookidEvent.create({
        data: {
          eventId: payload.eventId,
          type: payload.type,
          lineUserId: payload.userId,
          timestamp: BigInt(payload.timestamp),
          status: 'PENDING',
          referenceId,
          payload: JSON.stringify(payload.data),
        },
      });

      // ตอบกลับ 200 OK ทันที
      // ในระหว่างนี้จะ queue event เพื่อประมวลผลแบบ async
      this.processEventAsync(payload, referenceId).catch((error) => {
        this.logger.error(`Async processing failed for ${referenceId}:`, error);
      });

      return {
        status: 'received',
        message: 'Event received. Processing...',
        referenceId,
      };
    } catch (error) {
      this.logger.error('Failed to handle webhook:', error);
      throw error;
    }
  }

  /**
   * ประมวลผล Event แบบ Async
   * - จัดการข้อความ
   * - สร้าง/อัปเดต Ticket
   * - ส่งการแจ้งเตือน
   * - บันทึกผลลัพธ์
   */
  private async processEventAsync(
    payload: HookidPayload,
    referenceId: string,
  ): Promise<void> {
    try {
      // อัปเดตสถานะเป็น PROCESSING
      await this.prisma.hookidEvent.update({
        where: { eventId: payload.eventId },
        data: { status: 'PROCESSING' },
      });

      // จัดการแต่ละ event type
      let ticketId: string | null = null;

      switch (payload.type) {
        case 'message':
          ticketId = await this.handleMessageEvent(payload);
          break;
        case 'postback':
          ticketId = await this.handlePostbackEvent(payload);
          break;
        case 'follow':
          await this.handleFollowEvent(payload);
          break;
        case 'unfollow':
          await this.handleUnfollowEvent(payload);
          break;
      }

      // อัปเดตสถานะเป็น PROCESSED
      await this.prisma.hookidEvent.update({
        where: { eventId: payload.eventId },
        data: {
          status: 'PROCESSED',
          referenceId: ticketId || referenceId,
          processedAt: new Date(),
        },
      });

      // ส่งสถานะกลับไปยัง Hookid (ถ้ามี callback URL)
      await this.notifyProcessingStatus(referenceId, 'processed', ticketId);

      this.logger.log(
        `Event processed successfully: ${referenceId} → Ticket: ${ticketId}`,
      );
    } catch (error) {
      this.logger.error(`Processing failed for event ${referenceId}:`, error);

      // อัปเดตสถานะเป็น FAILED
      await this.prisma.hookidEvent.update({
        where: { eventId: payload.eventId },
        data: {
          status: 'FAILED',
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
          retryCount: { increment: 1 },
        },
      });

      await this.notifyProcessingStatus(
        referenceId,
        'error',
        null,
        error instanceof Error ? error.message : 'Unknown error',
      );
    }
  }

  /**
   * จัดการ Message Event
   * - หาผู้ใช้ที่เชื่อมต่อ LINE
   * - สร้าง Ticket ใหม่
   * - ส่ง LINE notification
   */
  private async handleMessageEvent(payload: HookidPayload): Promise<string> {
    const message = payload.data.message || '';
    this.logger.log(`Processing message: ${message}`);

    // หา LINE Link ของผู้ใช้
    const lineLink = await this.prisma.lineOALink.findFirst({
      where: { lineUserId: payload.userId, status: 'VERIFIED' },
      include: { user: true },
    });

    if (!lineLink) {
      this.logger.warn(`No linked user found for LINE ID: ${payload.userId}`);
      // ส่ง LINE message ให้ทำการ link
      await this.sendLinkingPrompt(payload.userId);
      return '';
    }

    // สร้าง Ticket ใหม่
    const ticketCode = this.generateTicketCode();

    const ticket = await this.prisma.ticket.create({
      data: {
        ticketCode,
        title: message.substring(0, 100),
        description: message,
        problemCategory: 'OTHER',
        problemSubcategory: 'OTHER',
        equipmentName: 'Not specified',
        location: 'Not specified',
        category: 'General',
        priority: 'MEDIUM',
        status: 'OPEN',
        userId: lineLink.userId,
      },
    });

    // ส่ง LINE notification
    const successMessage: line.TextMessage = {
      type: 'text',
      text: `✅ รับแจ้งซ่อมเรียบร้อย\n\nเลขที่: ${ticket.ticketCode}\nรายละเอียด: ${message}\nสถานะ: รอรับเรื่อง\n\nเจ้าหน้าที่จะติดต่อกลับโดยเร็ว`,
    };

    try {
      await this.lineClient.pushMessage(payload.userId, successMessage);
    } catch (error) {
      this.logger.error(`Failed to send LINE message:`, error);
    }

    return ticket.ticketCode;
  }

  /**
   * จัดการ Postback Event
   * - ปุ่มใน Flex Message, Rich Menu, etc.
   */
  private async handlePostbackEvent(payload: HookidPayload): Promise<string> {
    const postbackData = payload.data.postbackData || '';
    this.logger.log(`Processing postback: ${postbackData}`);

    // ตัวอย่าง: "ticket_status_inquiry"
    // ส่งข้อมูล ticket status กลับ

    const lineLink = await this.prisma.lineOALink.findFirst({
      where: { lineUserId: payload.userId, status: 'VERIFIED' },
    });

    if (!lineLink) {
      await this.sendLinkingPrompt(payload.userId);
      return '';
    }

    // ดึง ticket ล่าสุดของผู้ใช้
    const latestTicket = await this.prisma.ticket.findFirst({
      where: { userId: lineLink.userId },
      orderBy: { createdAt: 'desc' },
    });

    if (!latestTicket) {
      const noTicketMessage: line.TextMessage = {
        type: 'text',
        text: '❌ ไม่พบข้อมูลแจ้งซ่อมของคุณ',
      };
      await this.lineClient.pushMessage(payload.userId, noTicketMessage);
      return '';
    }

    // ส่ง ticket status
    const statusMessage: line.TextMessage = {
      type: 'text',
      text: `📌 สถานะล่าสุด\n\nเลขที่: ${latestTicket.ticketCode}\nสถานะ: ${latestTicket.status}\nอัปเดต: ${latestTicket.updatedAt.toLocaleString('th-TH')}`,
    };

    await this.lineClient.pushMessage(payload.userId, statusMessage);

    return latestTicket.ticketCode;
  }

  /**
   * จัดการ Follow Event
   */
  private async handleFollowEvent(payload: HookidPayload): Promise<void> {
    this.logger.log(`User ${payload.userId} followed the OA`);

    // ส่ง welcome message
    const welcomeMessage: line.TextMessage = {
      type: 'text',
      text: `👋 ยินดีต้อนรับเข้าสู่ระบบแจ้งซ่อม\n\nคำสั่งทั้งหมด:\n• "สอบถาม" - ตรวจสอบสถานะแจ้งซ่อม\n• "แจ้งซ่อม" - สร้างแจ้งซ่อมใหม่`,
    };

    try {
      await this.lineClient.pushMessage(payload.userId, welcomeMessage);
    } catch (error) {
      this.logger.error(`Failed to send welcome message:`, error);
    }
  }

  /**
   * จัดการ Unfollow Event
   */
  private async handleUnfollowEvent(payload: HookidPayload): Promise<void> {
    this.logger.log(`User ${payload.userId} unfollowed the OA`);

    // อัปเดต LINE link status
    await this.prisma.lineOALink.updateMany({
      where: { lineUserId: payload.userId },
      data: { status: 'UNLINKED' },
    });
  }

  /**
   * ส่งข้อความให้ link บัญชี
   */
  private async sendLinkingPrompt(lineUserId: string): Promise<void> {
    const linkingMessage: line.TextMessage = {
      type: 'text',
      text: `🔗 กรุณาเชื่อมต่อบัญชี\n\nคลิกลิงก์นี้เพื่อเชื่อมต่อบัญชี:\n${process.env.FRONTEND_URL || 'https://yourapp.com'}/line/linking`,
    };

    try {
      await this.lineClient.pushMessage(lineUserId, linkingMessage);
    } catch (error) {
      this.logger.error(`Failed to send linking prompt:`, error);
    }
  }

  /**
   * สร้าง Ticket Code
   */
  private generateTicketCode(): string {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0].replace(/-/g, '');
    const random = Math.random().toString(36).substring(2, 7).toUpperCase();
    return `TK${dateStr}${random}`;
  }

  /**
   * ส่งสถานะการประมวลผลกลับไป
   * (สามารถส่งไปยัง Hookid callback URL หรือ webhook ของลูกค้า)
   */
  private async notifyProcessingStatus(
    referenceId: string,
    status: 'processed' | 'error',
    ticketId: string | null,
    errorMessage?: string,
  ): Promise<void> {
    const webhookUrl = process.env.HOOKID_CALLBACK_URL;

    if (!webhookUrl) {
      this.logger.warn('No HOOKID_CALLBACK_URL configured');
      return;
    }

    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.hookidSecret}`,
        },
        body: JSON.stringify({
          referenceId,
          status,
          ticketId,
          timestamp: new Date().toISOString(),
          errorMessage: errorMessage || null,
        }),
      });

      if (!response.ok) {
        this.logger.warn(
          `Hookid callback returned status ${response.status}`,
        );
      }
    } catch (error) {
      this.logger.error('Failed to notify hookid callback:', error);
      // ไม่ throw error เพื่อไม่ให้ทั้ง process ล้มเหลว
    }
  }
}
