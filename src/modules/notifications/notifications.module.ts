import { Module } from '@nestjs/common';
import { DatabaseModule } from '@database/database.module';
import { LineModule } from '@modules/line/line.module';
import { LineNotifyService } from './line-notify.service';

@Module({
  imports: [DatabaseModule, LineModule],
  providers: [LineNotifyService],
  exports: [LineNotifyService],
})
export class NotificationsModule {}
