import {
  Controller,
  Post,
  Body,
  Headers,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiResponse as ApiDocResponse } from '@nestjs/swagger';
import { LineService } from './line.service';
import { Public } from '@common/decorators/public.decorator';

@ApiTags('line')
@Controller('api/v1/line')
export class LineController {
  constructor(private readonly lineService: LineService) {}

  @Public()
  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  @ApiDocResponse({ status: 200, description: 'Webhook processed successfully' })
  async webhook(
    @Body() body: any,
    @Headers('x-line-signature') signature: string,
  ): Promise<{ status: string }> {
    if (!signature) {
      throw new BadRequestException('Missing x-line-signature header');
    }

    if (!body.events || !Array.isArray(body.events)) {
      throw new BadRequestException('Invalid webhook body format');
    }

    try {
      await this.lineService.handleWebhook(body, signature);
      return { status: 'ok' };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to process webhook');
    }
  }
}