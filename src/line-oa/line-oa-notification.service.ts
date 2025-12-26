import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LineOAService } from './line-oa.service';

export interface LineNotificationPayload {
  type: string;
  title: string;
  message: string;
  actionUrl?: string;
  richMessage?: any;
}

@Injectable()
export class LineOANotificationService {
  private readonly logger = new Logger(LineOANotificationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly lineOAService: LineOAService,
  ) {}

  /**
   * ส่งการแจ้งเตือนไปยัง LINE
   */
  async sendNotification(userId: number, payload: LineNotificationPayload) {
    try {
      // หาการเชื่อมต่อ LINE ของผู้ใช้
      const lineLink = await this.prisma.lineOALink.findUnique({
        where: { userId },
      });

      // ถ้าไม่ได้เชื่อมต่อ LINE ก็ข้ามไป
      if (!lineLink || lineLink.status !== 'VERIFIED') {
        this.logger.warn(
          `User ${userId} is not linked to LINE, skipping notification`,
        );
        return {
          success: false,
          reason: 'User not linked to LINE',
        };
      }

      // Check if lineUserId exists
      if (!lineLink.lineUserId) {
        return {
          success: false,
          error: 'User has not linked their LINE account yet',
        };
      }

      // สร้างข้อความให้ LINE
      const message = this.createMessage(payload);

      // ส่งข้อความไปยัง LINE
      await this.lineOAService.sendMessage(lineLink.lineUserId, message);

      // บันทึกใน database
      await this.prisma.lineNotification.create({
        data: {
          lineUserId: lineLink.lineUserId,
          type: payload.type,
          title: payload.title,
          message: payload.message,
          status: 'SENT',
        },
      });

      this.logger.log(
        `Notification sent to user ${userId} via LINE (${lineLink.lineUserId})`,
      );

      return {
        success: true,
        message: 'Notification sent successfully',
      };
    } catch (error) {
      this.logger.error(`Failed to send notification to user ${userId}:`, error);

      // บันทึก error
      try {
        const lineLink = await this.prisma.lineOALink.findUnique({
          where: { userId },
        });
        if (lineLink && lineLink.lineUserId) {
          await this.prisma.lineNotification.create({
            data: {
              lineUserId: lineLink.lineUserId,
              type: payload.type,
              title: payload.title,
              message: payload.message,
              status: 'FAILED',
              errorMessage: error.message,
            },
          });
        }
      } catch (dbError) {
        this.logger.error('Failed to log notification error:', dbError);
      }

      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * ส่งการแจ้งเตือนไปยังหลายผู้ใช้
   */
  async sendBulkNotification(
    userIds: number[],
    payload: LineNotificationPayload,
  ) {
    const results: Array<{
      userId: number;
      success: boolean;
      reason?: string;
      message?: string;
      error?: string;
    }> = [];

    for (const userId of userIds) {
      const result = await this.sendNotification(userId, payload);
      results.push({
        userId,
        ...(result as any),
      });
    }

    return {
      total: userIds.length,
      successful: results.filter((r) => r.success).length,
      failed: results.filter((r) => !r.success).length,
      results,
    };
  }

  /**
   * สร้างข้อความสำหรับ LINE
   */
  private createMessage(payload: LineNotificationPayload): any {
    // ถ้ามี rich message ให้ใช้ นั่นแล้ว
    if (payload.richMessage) {
      return payload.richMessage;
    }

    // สร้าง text message
    let messageText = `📬 ${payload.title}\n\n${payload.message}`;

    if (payload.actionUrl) {
      messageText += `\n\n👉 ดูรายละเอียด: ${payload.actionUrl}`;
    }

    return {
      type: 'text',
      text: messageText,
    };
  }

  /**
   * สร้าง Flex Message สำหรับการแจ้งเตือนงาน
   */
  createTicketMessage(ticketData: {
    code: string;
    title: string;
    description: string;
    priority: string;
    actionUrl: string;
  }) {
    const priorityEmoji = {
      LOW: '🟢',
      MEDIUM: '🟡',
      HIGH: '🔴',
    };

    return {
      type: 'flex',
      altText: `งาน ${ticketData.code}: ${ticketData.title}`,
      contents: {
        type: 'bubble',
        header: {
          type: 'box',
          layout: 'vertical',
          contents: [
            {
              type: 'text',
              text: '📋 มีงานใหม่',
              weight: 'bold',
              size: 'xl',
              color: '#000000',
            },
          ],
          backgroundColor: '#f0f0f0',
          paddingAll: 'md',
        },
        body: {
          type: 'box',
          layout: 'vertical',
          spacing: 'md',
          contents: [
            {
              type: 'box',
              layout: 'baseline',
              contents: [
                {
                  type: 'text',
                  text: 'รหัส:',
                  color: '#aaaaaa',
                  size: 'sm',
                  flex: 2,
                },
                {
                  type: 'text',
                  text: ticketData.code,
                  wrap: true,
                  color: '#666666',
                  size: 'sm',
                  flex: 3,
                },
              ],
            },
            {
              type: 'box',
              layout: 'baseline',
              contents: [
                {
                  type: 'text',
                  text: 'หัวข้อ:',
                  color: '#aaaaaa',
                  size: 'sm',
                  flex: 2,
                },
                {
                  type: 'text',
                  text: ticketData.title,
                  wrap: true,
                  color: '#666666',
                  size: 'sm',
                  flex: 3,
                },
              ],
            },
            {
              type: 'box',
              layout: 'baseline',
              contents: [
                {
                  type: 'text',
                  text: 'ความสำคัญ:',
                  color: '#aaaaaa',
                  size: 'sm',
                  flex: 2,
                },
                {
                  type: 'text',
                  text: `${priorityEmoji[ticketData.priority]} ${ticketData.priority}`,
                  color: '#666666',
                  size: 'sm',
                  flex: 3,
                },
              ],
            },
          ],
        },
        footer: {
          type: 'box',
          layout: 'vertical',
          spacing: 'sm',
          contents: [
            {
              type: 'button',
              style: 'link',
              height: 'sm',
              action: {
                type: 'uri',
                label: 'ดูรายละเอียด',
                uri: ticketData.actionUrl,
              },
            },
          ],
          flex: 0,
        },
      },
    };
  }

  /**
   * ส่งแจ้งเตือน Ticket Status Update
   */
  async notifyTicketStatusUpdate(
    userId: number,
    ticketCode: string,
    ticketId: number,
    newStatus: string,
    problem: string,
    comment?: string,
  ) {
    const statusEmoji = {
      OPEN: '📌',
      IN_PROGRESS: '⚙️',
      WAITING_USER: '⏳',
      DONE: '✅',
      CANCEL: '❌',
    };

    const statusMessage = {
      OPEN: 'รอรับเรื่อง',
      IN_PROGRESS: 'กำลังดำเนินการ',
      WAITING_USER: 'รอข้อมูลเพิ่มเติม',
      DONE: 'เสร็จสิ้น',
      CANCEL: 'ยกเลิก',
    };

    const message = `${statusEmoji[newStatus]} อัปเดตสถานะแจ้งซ่อม\n\nเลขที่: ${ticketCode}\nปัญหา: ${problem}\nสถานะ: ${statusMessage[newStatus]}\n${comment ? `\nหมายเหตุ: ${comment}` : ''}\n\nขอบคุณที่ใช้บริการฝ่าย IT`;

    return this.sendNotification(userId, {
      type: 'TICKET_STATUS_CHANGED',
      title: `อัปเดต: ${ticketCode}`,
      message,
      actionUrl: `${process.env.FRONTEND_URL}/tickets/${ticketId}`,
    });
  }

  /**
   * ส่งแจ้งเตือน Ticket Created
   */
  async notifyTicketCreated(
    userId: number,
    ticketCode: string,
    ticketId: number,
    problem: string,
  ) {
    const message = `✅ รับแจ้งซ่อมเรียบร้อย\n\nเลขที่แจ้งซ่อม: ${ticketCode}\nปัญหา: ${problem}\nสถานะ: รอรับเรื่อง\n\nเจ้าหน้าที่จะติดต่อกลับโดยเร็ว`;

    return this.sendNotification(userId, {
      type: 'TICKET_CREATED',
      title: `สร้างแจ้งซ่อม: ${ticketCode}`,
      message,
      actionUrl: `${process.env.FRONTEND_URL}/tickets/${ticketId}`,
    });
  }

  /**
   * Retry การส่งที่ล้มเหลว
   */
  async retryFailedNotifications() {
    const failedNotifications = await this.prisma.lineNotification.findMany({
      where: {
        status: 'FAILED',
        retryCount: {
          lt: 3, // ลองใหม่แค่ 3 ครั้ง
        },
      },
      orderBy: { createdAt: 'asc' },
      take: 10, // ลองใหม่ 10 รายการ ต่อครั้ง
    });

    for (const notification of failedNotifications) {
      try {
        // ลองส่งใหม่
        await this.lineOAService.sendMessage(notification.lineUserId, {
          type: 'text',
          text: notification.message,
        });

        // อัปเดตสถานะ
        await this.prisma.lineNotification.update({
          where: { id: notification.id },
          data: {
            status: 'SENT',
            retryCount: notification.retryCount + 1,
          },
        });

        this.logger.log(
          `Retry notification ${notification.id} succeeded`,
        );
      } catch (error) {
        // อัปเดต retry count
        await this.prisma.lineNotification.update({
          where: { id: notification.id },
          data: {
            retryCount: notification.retryCount + 1,
            errorMessage: error.message,
          },
        });

        this.logger.error(
          `Retry notification ${notification.id} failed:`,
          error,
        );
      }
    }

    return {
      processed: failedNotifications.length,
    };
  }
}
