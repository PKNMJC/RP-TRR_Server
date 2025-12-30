import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';
import { Public } from '@common/decorators/public.decorator';

@ApiTags('health')
@Controller('api/v1')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Public()
  @Get('health')
  getHealth() {
    return {
      success: true,
      data: this.appService.getHello(),
      timestamp: new Date().toISOString(),
    };
  }
}
