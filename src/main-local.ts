import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { Logger, ValidationPipe as NestValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from '@common/filters/http-exception.filter';
import { LoggingInterceptor } from '@common/interceptors/logging.interceptor';
import { TransformInterceptor } from '@common/interceptors/transform.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const logger = new Logger('Bootstrap');

  const port = configService.get<number>('APP_PORT') || 3000;

  // CORS configuration
  app.enableCors({
    origin: [
      configService.get<string>('FRONTEND_URL'),
      configService.get<string>('LIFF_URL'),
    ],
    credentials: true,
  });

  // Global exception filter
  app.useGlobalFilters(new HttpExceptionFilter());

  // Global interceptors
  app.useGlobalInterceptors(
    new LoggingInterceptor(),
    new TransformInterceptor(),
  );

  // Global validation pipe
  app.useGlobalPipes(
    new NestValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('IT Repair Ticketing System API')
    .setDescription('Professional IT repair ticketing system API with LINE integration')
    .setVersion('1.0.0')
    .addBearerAuth()
    .addTag('auth', 'Authentication endpoints')
    .addTag('tickets', 'Ticket management endpoints')
    .addTag('users', 'User management endpoints')
    .addTag('departments', 'Department management endpoints')
    .addTag('admins', 'Admin management endpoints')
    .addTag('line', 'LINE integration endpoints')
    .addTag('analytics', 'Analytics endpoints')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(port, () => {
    logger.log(`Application is running on port ${port}`);
    logger.log(`Swagger documentation available at http://localhost:${port}/api/docs`);
  });
}

bootstrap().catch(err => {
  console.error('Failed to start application:', err);
  process.exit(1);
});
