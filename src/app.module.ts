import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { DatabaseModule } from '@database/database.module';
import { AuthModule } from '@modules/auth/auth.module';
import { TicketsModule } from '@modules/tickets/tickets.module';
import { UsersModule } from '@modules/users/users.module';
import { DepartmentsModule } from '@modules/departments/departments.module';
import { AdminsModule } from '@modules/admins/admins.module';
import { AttachmentsModule } from '@modules/attachments/attachments.module';
import { LineModule } from '@modules/line/line.module';
import { NotificationsModule } from '@modules/notifications/notifications.module';
import { WebsocketModule } from '@modules/websocket/websocket.module';
import { AnalyticsModule } from '@modules/analytics/analytics.module';
import { databaseConfig } from '@config/database.config';
import { lineConfig } from '@config/line.config';
import { awsConfig } from '@config/aws.config';
import { redisConfig } from '@config/redis.config';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: [databaseConfig, lineConfig, awsConfig, redisConfig],
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 60 seconds
        limit: 100, // 100 requests per minute
      },
    ]),
    DatabaseModule,
    AuthModule,
    TicketsModule,
    UsersModule,
    DepartmentsModule,
    AdminsModule,
    AttachmentsModule,
    LineModule,
    NotificationsModule,
    WebsocketModule,
    AnalyticsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
