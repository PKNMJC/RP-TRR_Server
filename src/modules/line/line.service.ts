import { Injectable, BadRequestException, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { PrismaService } from '@database/prisma.service';
import { firstValueFrom } from 'rxjs';
import * as crypto from 'crypto';

@Injectable()
export class LineService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async handleWebhook(body: any, signature: string): Promise<void> {
    // Verify webhook signature
    if (!this.verifySignature(body, signature)) {
      throw new BadRequestException('Invalid LINE webhook signature');
    }

    // Process each event
    for (const event of body.events) {
      try {
        if (event.type === 'message' && event.message.type === 'text') {
          await this.handleTextMessage(event.message.text, event.source.userId);
        } else if (event.type === 'follow') {
          await this.handleFollowEvent(event.source.userId);
        } else if (event.type === 'unfollow') {
          await this.handleUnfollowEvent(event.source.userId);
        }
      } catch (error) {
        console.error('Error processing LINE event:', error);
      }
    }
  }

  private verifySignature(body: any, signature: string): boolean {
    const channelSecret = this.configService.get<string>('line.channelSecret');
    if (!channelSecret) {
      throw new BadRequestException('LINE_CHANNEL_SECRET not configured');
    }
    const hash = crypto
      .createHmac('sha256', channelSecret)
      .update(JSON.stringify(body))
      .digest('base64');

    return hash === signature;
  }

  private async handleTextMessage(text: string, lineUserId: string): Promise<void> {
    // Get or create user
    let user = await this.prisma.user.findUnique({
      where: { lineUserId },
    });

    if (!user) {
      // Fetch profile from LINE API
      const profile = await this.getLineProfile(lineUserId);

      user = await this.prisma.user.create({
        data: {
          lineUserId,
          displayName: profile.displayName,
          pictureUrl: profile.pictureUrl || null,
          statusMessage: profile.statusMessage || null,
          firstSeenAt: new Date(),
          lastSeenAt: new Date(),
          ticketCount: 0,
        },
      });
    } else {
      // Update last seen
      await this.prisma.user.update({
        where: { id: user.id },
        data: { lastSeenAt: new Date() },
      });
    }

    // Send menu message back to user
    const liffId = this.configService.get<string>('line.liffId');
    await this.sendLineMessage(lineUserId, [
      {
        type: 'template',
        altText: 'IT Support Menu',
        template: {
          type: 'buttons',
          title: 'IT Repair System',
          text: 'สวัสดีคุณ ' + user.displayName + ' !\nเลือกสิ่งที่คุณต้องการ',
          actions: [
            {
              type: 'uri',
              label: '🎫 สร้าง Ticket ใหม่',
              uri: `line://liff/${liffId}`,
            },
            {
              type: 'message',
              label: '📋 ดูสถานะ Ticket',
              text: 'ดูสถานะของฉัน',
            },
          ],
        },
      },
    ]);
  }

  private async handleFollowEvent(lineUserId: string): Promise<void> {
    // Get user profile when they follow the bot
    const profile = await this.getLineProfile(lineUserId);

    const user = await this.prisma.user.create({
      data: {
        lineUserId,
        displayName: profile.displayName,
        pictureUrl: profile.pictureUrl || null,
        statusMessage: profile.statusMessage || null,
        firstSeenAt: new Date(),
        lastSeenAt: new Date(),
        ticketCount: 0,
      },
      select: { id: true, displayName: true },
    });

    // Send welcome message
    await this.sendLineMessage(lineUserId, [
      {
        type: 'text',
        text: 'ยินดีต้อนรับสู่ IT Repair System! 🎉\nคลิก "สร้าง Ticket" เพื่อแจ้งปัญหา IT',
      },
    ]);
  }

  private async handleUnfollowEvent(lineUserId: string): Promise<void> {
    // Just log when user unfollow
    console.log('User unfollowed:', lineUserId);
  }

  async getLineProfile(lineUserId: string): Promise<any> {
    try {
      const accessToken = this.configService.get<string>('line.channelAccessToken');

      const response = await firstValueFrom(
        this.httpService.get(
          `https://api.line.me/v2/bot/profile/${lineUserId}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          },
        ),
      );

      return (response as any).data;
    } catch (error) {
      console.error('Error fetching LINE profile:', error);
      throw new HttpException(
        'Failed to fetch LINE profile',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async sendLineMessage(userId: string, messages: any[]): Promise<void> {
    try {
      const accessToken = this.configService.get<string>('line.channelAccessToken');

      await firstValueFrom(
        this.httpService.post(
          'https://api.line.me/v2/bot/message/push',
          {
            to: userId,
            messages,
          },
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
          },
        ),
      );
    } catch (error) {
      console.error('Error sending LINE message:', error);
      throw new HttpException(
        'Failed to send LINE message',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async sendLineNotify(
    lineUserId: string,
    title: string,
    message: string,
  ): Promise<void> {
    const formattedMessage = `
📢 ${title}
${message}
    `.trim();

    await this.sendLineMessage(lineUserId, [
      {
        type: 'text',
        text: formattedMessage,
      },
    ]);
  }
}