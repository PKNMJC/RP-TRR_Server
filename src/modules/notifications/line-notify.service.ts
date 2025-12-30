import { Injectable } from '@nestjs/common';
import { LineService } from '@modules/line/line.service';

interface NotificationPayload {
  lineUserId: string;
  title: string;
  message: string;
  ticketNumber?: string;
  status?: string;
}

@Injectable()
export class LineNotifyService {
  constructor(private readonly lineService: LineService) {}

  async notifyTicketCreated(payload: NotificationPayload): Promise<void> {
    const message = `
🎫 Ticket สร้างสำเร็จ!

หมายเลข: ${payload.ticketNumber || 'N/A'}
เรื่อง: ${payload.message}
สถานะ: 🔵 Pending

กรุณารอการยืนยันจากทีมช่วยเหลือ IT
    `.trim();

    try {
      await this.lineService.sendLineNotify(
        payload.lineUserId,
        'Ticket Created',
        message,
      );
    } catch (error) {
      console.error('Failed to send ticket created notification:', error);
    }
  }

  async notifyTicketAssigned(payload: NotificationPayload): Promise<void> {
    const message = `
🔄 Ticket ${payload.ticketNumber} ได้รับการมอบหมาย

เรื่อง: ${payload.message}
สถานะ: 🟠 In Progress

ทีม IT จะติดต่อคุณในอีกสักครู่
    `.trim();

    try {
      await this.lineService.sendLineNotify(
        payload.lineUserId,
        'Ticket Assigned',
        message,
      );
    } catch (error) {
      console.error('Failed to send ticket assigned notification:', error);
    }
  }

  async notifyTicketUpdated(payload: NotificationPayload): Promise<void> {
    const statusEmoji = this.getStatusEmoji(payload.status);
    const statusText = this.getStatusText(payload.status);

    const message = `
📢 Ticket ${payload.ticketNumber} ได้รับการอัปเดต

เรื่อง: ${payload.message}
สถานะ: ${statusEmoji} ${statusText}

กรุณาตรวจสอบรายละเอียดเพิ่มเติม
    `.trim();

    try {
      await this.lineService.sendLineNotify(
        payload.lineUserId,
        'Ticket Updated',
        message,
      );
    } catch (error) {
      console.error('Failed to send ticket updated notification:', error);
    }
  }

  async notifyTicketCompleted(payload: NotificationPayload): Promise<void> {
    const message = `
✅ Ticket ${payload.ticketNumber} เสร็จสิ้นแล้ว!

เรื่อง: ${payload.message}
สถานะ: 🟢 Completed

ขอบคุณที่ใช้งาน IT Repair System
หากมีปัญหาเพิ่มเติม สามารถสร้าง Ticket ใหม่ได้ตลอดเวลา
    `.trim();

    try {
      await this.lineService.sendLineNotify(
        payload.lineUserId,
        'Ticket Completed',
        message,
      );
    } catch (error) {
      console.error('Failed to send ticket completed notification:', error);
    }
  }

  async notifyTicketCancelled(payload: NotificationPayload): Promise<void> {
    const message = `
❌ Ticket ${payload.ticketNumber} ถูกยกเลิก

เรื่อง: ${payload.message}
สถานะ: ⚫ Cancelled

หากคุณมีคำถามใดๆ โปรดติดต่อทีม IT
    `.trim();

    try {
      await this.lineService.sendLineNotify(
        payload.lineUserId,
        'Ticket Cancelled',
        message,
      );
    } catch (error) {
      console.error('Failed to send ticket cancelled notification:', error);
    }
  }

  private getStatusEmoji(status: string | undefined): string {
    const emojiMap: Record<string, string> = {
      pending: '🔵',
      in_progress: '🟠',
      completed: '🟢',
      cancelled: '⚫',
    };
    return emojiMap[status || ''] || '⚪';
  }

  private getStatusText(status: string | undefined): string {
    const statusMap: Record<string, string> = {
      pending: 'Pending',
      in_progress: 'In Progress',
      completed: 'Completed',
      cancelled: 'Cancelled',
    };
    return statusMap[status || ''] || 'Unknown';
  }
}
