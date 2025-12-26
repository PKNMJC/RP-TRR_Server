import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Headers,
  HttpCode,
  Query,
} from '@nestjs/common';
import { LineOAService } from './line-oa.service';
import { LineOALinkingService } from './line-oa-linking.service';
import { LineOAWebhookService } from './line-oa-webhook.service';
import { PrismaService } from '../prisma/prisma.service';

@Controller('/api/line-oa')
export class LineOAController {
  constructor(
    private readonly lineOAService: LineOAService,
    private readonly linkingService: LineOALinkingService,
    private readonly webhookService: LineOAWebhookService,
    private readonly prisma: PrismaService,
  ) {}

  // ===================== Account Linking =====================

  /**
   * เริ่มต้นกระบวนการเชื่อมต่อบัญชี LINE
   */
  @Post('linking/initiate')
  async initiateLinking(
    @Body('userId') userId: number = 1, // Default to user 1 for testing
  ) {
    return await this.linkingService.initiateLinking(userId || 1);
  }

  /**
   * ยืนยันการเชื่อมต่อ LINE
   */
  @Post('linking/verify')
  async verifyLink(
    @Body('userId') userId?: number,
    @Body('lineUserId') lineUserId?: string,
    @Body('verificationToken') verificationToken?: string,
  ) {
    // ถ้าไม่มี userId ให้สร้าง account ใหม่
    if (!userId || userId === 0) {
      // สร้าง user ใหม่สำหรับ LINE
      const newUser = await this.prisma.user.create({
        data: {
          name: `LINE User ${lineUserId?.substring(0, 8)}`,
          email: `line_${lineUserId}@line.local`,
          password: 'line_oauth_' + Math.random().toString(36).substring(7),
          department: 'General',
        },
      });
      userId = newUser.id;
    }

    return await this.linkingService.verifyLink(
      userId || 1,
      lineUserId || '',
      verificationToken || '',
    );
  }

  /**
   * ดึงสถานะการเชื่อมต่อ LINE
   */
  @Get('linking/status')
  async getLinkingStatus(@Query('userId') userId: string = '1') {
    return await this.linkingService.getLinkingStatus(parseInt(userId) || 1);
  }

  /**
   * ยกเลิกการเชื่อมต่อ LINE
   */
  @Delete('linking')
  async unlinkAccount(@Query('userId') userId: string = '1') {
    return await this.linkingService.unlinkAccount(parseInt(userId) || 1);
  }

  // ===================== Webhook =====================

  /**
   * LINE Webhook Endpoint
   */
  @Post('webhook')
  @HttpCode(200)
  async handleWebhook(
    @Body() body: any,
    @Headers('x-line-signature') signature: string,
  ) {
    return await this.webhookService.handleWebhook(body, signature || '');
  }

  // ===================== Notifications =====================

  /**
   * ดึงประวัติการแจ้งเตือนผ่าน LINE
   */
  @Get('notifications')
  async getNotifications(
    @Query('userId') userId: string = '1',
    @Query('limit') limit: string = '20',
  ) {
    return await this.lineOAService.getNotifications(
      parseInt(userId) || 1,
      parseInt(limit) || 20,
    );
  }

  // ===================== Health Check =====================

  /**
   * ตรวจสอบสถานะการทำงาน
   */
  @Get('health')
  async healthCheck() {
    return {
      status: 'ok',
      message: 'LINE OA integration is running',
    };
  }
}
