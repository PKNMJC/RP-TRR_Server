import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as line from '@line/bot-sdk';

@Injectable()
export class LineOAService {
  private readonly logger = new Logger(LineOAService.name);
  private readonly lineClient: line.Client;

  constructor(private readonly prisma: PrismaService) {
    // Initialize LINE Bot SDK Client
    this.lineClient = new line.Client({
      channelSecret: process.env.LINE_CHANNEL_SECRET || '',
      channelAccessToken: process.env.LINE_ACCESS_TOKEN || '',
    });
    this.logger.log('LINE OA service initialized with credentials');
  }

  /**
   * ส่งข้อความไปยัง LINE User
   */
  async sendMessage(lineUserId: string, message: line.Message) {
    try {
      await this.lineClient.pushMessage(lineUserId, message);
      this.logger.log(`Message sent to ${lineUserId}`);
      return { success: true };
    } catch (error) {
      this.logger.error(`Failed to send message to ${lineUserId}:`, error);
      throw error;
    }
  }

  /**
   * ดึงประวัติการแจ้งเตือน LINE ของผู้ใช้
   */
  async getNotifications(userId: number, limit: number = 20) {
    // หาการเชื่อมต่อ LINE ของผู้ใช้
    const lineLink = await this.prisma.lineOALink.findUnique({
      where: { userId },
    });

    if (!lineLink || !lineLink.lineUserId) {
      return {
        isLinked: false,
        data: [],
      };
    }

    // ดึงประวัติการแจ้งเตือน
    const notifications = await this.prisma.lineNotification.findMany({
      where: { lineUserId: lineLink.lineUserId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return {
      isLinked: true,
      data: notifications,
      total: notifications.length,
    };
  }

  /**
   * ส่งข้อความแจ้งเตือนสถานะ Ticket ไปยัง LINE
   */
  async sendTicketStatusNotification(
    lineUserId: string,
    ticketCode: string,
    status: string,
    problem: string,
    message: string,
  ) {
    const statusEmoji = {
      OPEN: '📌',
      IN_PROGRESS: '⚙️',
      WAITING_USER: '⏳',
      DONE: '✅',
      CANCEL: '❌',
    };

    const lineMessage: line.TextMessage = {
      type: 'text',
      text: `${statusEmoji[status] || '📌'} อัปเดตสถานะแจ้งซ่อม\n\nเลขที่: ${ticketCode}\nปัญหา: ${problem}\nสถานะ: ${status}\n\n${message}`,
    };

    return this.sendMessage(lineUserId, lineMessage);
  }

  /**
   * ส่งข้อความสำเร็จการแจ้งซ่อม
   */
  async sendTicketCreatedNotification(
    lineUserId: string,
    ticketCode: string,
    problem: string,
  ) {
    const lineMessage: line.TextMessage = {
      type: 'text',
      text: `✅ รับแจ้งซ่อมเรียบร้อย\n\nเลขที่แจ้งซ่อม: ${ticketCode}\nปัญหา: ${problem}\nสถานะ: รอรับเรื่อง\n\nเจ้าหน้าที่จะติดต่อกลับโดยเร็ว`,
    };

    return this.sendMessage(lineUserId, lineMessage);
  }
}