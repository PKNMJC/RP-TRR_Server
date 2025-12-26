import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import crypto from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { LineOALinkingService } from './line-oa-linking.service';

@Injectable()
export class LineOAWebhookService {
  private readonly logger = new Logger(LineOAWebhookService.name);
  private readonly channelSecret = process.env.LINE_CHANNEL_SECRET || 'test-secret';

  constructor(
    private readonly prisma: PrismaService,
    private readonly linkingService: LineOALinkingService,
  ) {}

  /**
   * ตรวจสอบและจัดการ LINE Webhook Event
   */
  async handleWebhook(body: any, signature: string) {
    // ตรวจสอบลายเซนต์
    if (!this.verifySignature(JSON.stringify(body), signature)) {
      this.logger.warn('Invalid webhook signature');
      throw new UnauthorizedException('Invalid signature');
    }

    // จัดการ events
    if (body.events && Array.isArray(body.events)) {
      for (const event of body.events) {
        await this.handleEvent(event);
      }
    }

    return { message: 'Webhook processed' };
  }

  /**
   * ตรวจสอบลายเซนต์ของ LINE
   * ทุก webhook request ต้องลงนามด้วย HMAC SHA256
   */
  private verifySignature(body: string, signature: string): boolean {
    const hash = crypto
      .createHmac('sha256', this.channelSecret)
      .update(body)
      .digest('base64');

    return hash === signature;
  }

  /**
   * จัดการ LINE Event
   */
  private async handleEvent(event: any) {
    this.logger.debug(`Received event: ${event.type}`);

    switch (event.type) {
      case 'follow':
        await this.handleFollow(event);
        break;

      case 'unfollow':
        await this.handleUnfollow(event);
        break;

      case 'message':
        await this.handleMessage(event);
        break;

      case 'postback':
        await this.handlePostback(event);
        break;

      default:
        this.logger.warn(`Unknown event type: ${event.type}`);
    }
  }

  /**
   * จัดการ Follow Event
   */
  private async handleFollow(event: any) {
    const lineUserId = event.source.userId;
    this.logger.log(`User ${lineUserId} followed the OA`);
  }

  /**
   * จัดการ Unfollow Event
   */
  private async handleUnfollow(event: any) {
    const lineUserId = event.source.userId;
    this.logger.log(`User ${lineUserId} unfollowed the OA`);

    try {
      await this.prisma.lineOALink.updateMany({
        where: { lineUserId },
        data: { status: 'UNLINKED' },
      });
    } catch (error) {
      this.logger.error(`Failed to unlink user ${lineUserId}:`, error);
    }
  }

  /**
   * จัดการ Message Event
   */
  private async handleMessage(event: any) {
    const lineUserId = event.source.userId;
    const message = event.message;

    if (message.type !== 'text') return;

    this.logger.log(`Received message from ${lineUserId}: ${message.text}`);

    // ดึงการเชื่อมต่อ LINE ของผู้ใช้
    const lineLink = await this.prisma.lineOALink.findFirst({
      where: { lineUserId },
    });

    if (!lineLink) {
      // ยังไม่เชื่อมต่อบัญชี - แจ้งให้เชื่อมต่อ
      await this.linkingService.sendLinkingMessage(lineUserId);
      return;
    }

    // ตรวจสอบคำสั่ง
    const text = message.text.toLowerCase().trim();

    if (text.includes('แจ้งซ่อม') || text.includes('repair')) {
      await this.sendRepairFormLink(lineUserId);
    } else if (text.includes('สถานะ') || text.includes('status')) {
      await this.sendTicketStatusMessage(lineUserId, lineLink.userId);
    } else if (text.includes('ช่วย') || text.includes('help')) {
      await this.sendHelpMessage(lineUserId);
    }
  }

  /**
   * ส่งลิงก์แบบฟอร์มแจ้งซ่อม
   */
  private async sendRepairFormLink(lineUserId: string) {
    const formUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const client = new (require('@line/bot-sdk')).Client({
      channelSecret: this.channelSecret,
      channelAccessToken: process.env.LINE_ACCESS_TOKEN,
    });

    const message: any = {
      type: 'text',
      text: '🛠 กรุณาแจ้งซ่อมผ่านแบบฟอร์มด้านล่าง',
      quickReply: {
        items: [
          {
            type: 'action',
            action: {
              type: 'uri',
              label: '📝 แจ้งซ่อม',
              uri: `${formUrl}/tickets/create?lineId=${lineUserId}`,
            },
          },
          {
            type: 'action',
            action: {
              type: 'uri',
              label: '📋 ดูสถานะ',
              uri: `${formUrl}/tickets?lineId=${lineUserId}`,
            },
          },
        ],
      },
    };

    try {
      await client.pushMessage(lineUserId, message);
    } catch (error) {
      this.logger.error('Failed to send repair form link:', error);
    }
  }

  /**
   * ส่งข้อความสถานะแจ้งซ่อม
   */
  private async sendTicketStatusMessage(lineUserId: string, userId: number) {
    const tickets = await this.prisma.ticket.findMany({
      where: { userId },
      take: 5,
      orderBy: { createdAt: 'desc' },
    });

    const client = new (require('@line/bot-sdk')).Client({
      channelSecret: this.channelSecret,
      channelAccessToken: process.env.LINE_ACCESS_TOKEN,
    });

    if (tickets.length === 0) {
      const message: any = {
        type: 'text',
        text: '📌 คุณยังไม่มีแจ้งซ่อม',
      };
      await client.pushMessage(lineUserId, message);
      return;
    }

    let statusText = '📌 สถานะการแจ้งซ่อมของคุณ\n\n';
    tickets.forEach((ticket, index) => {
      const statusEmoji = {
        OPEN: '📌',
        IN_PROGRESS: '⚙️',
        WAITING_USER: '⏳',
        DONE: '✅',
        CANCEL: '❌',
      };

      statusText += `${index + 1}. ${statusEmoji[ticket.status]} ${ticket.ticketCode}\n`;
      statusText += `   ${ticket.title}\n`;
      statusText += `   สถานะ: ${ticket.status}\n\n`;
    });

    const message: any = {
      type: 'text',
      text: statusText,
    };

    await client.pushMessage(lineUserId, message);
  }

  /**
   * ส่งข้อความช่วยเหลือ
   */
  private async sendHelpMessage(lineUserId: string) {
    const client = new (require('@line/bot-sdk')).Client({
      channelSecret: this.channelSecret,
      channelAccessToken: process.env.LINE_ACCESS_TOKEN,
    });

    const message: any = {
      type: 'text',
      text: 'ℹ️ คู่มือการใช้งาน\n\n' +
            '📝 พิมพ์ "แจ้งซ่อม" เพื่อแจ้งปัญหา\n' +
            '📊 พิมพ์ "สถานะ" เพื่อตรวจสอบสถานะแจ้งซ่อม\n' +
            '📞 ติดต่อ IT: 02-xxx-xxxx',
    };

    await client.pushMessage(lineUserId, message);
  }

  /**
   * จัดการ Postback Event
   */
  private async handlePostback(event: any) {
    const lineUserId = event.source.userId;
    const postbackData = event.postback.data;

    this.logger.log(`Received postback from ${lineUserId}: ${postbackData}`);
  }
}
