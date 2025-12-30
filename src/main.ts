import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from '@common/filters/http-exception.filter';
import { LoggingInterceptor } from '@common/interceptors/logging.interceptor';
import { TransformInterceptor } from '@common/interceptors/transform.interceptor';
import { Request, Response } from 'express';

let app;

async function createApp() {
  if (!app) {
    app = await NestFactory.create(AppModule, {
      bufferLogs: true,
    });

    // Global setup
    app.enableCors({
      origin: process.env.FRONTEND_URL,
      credentials: true,
    });

    app.useGlobalFilters(new HttpExceptionFilter());
    app.useGlobalInterceptors(
      new LoggingInterceptor(),
      new TransformInterceptor(),
    );

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    // Swagger (เปิดเฉพาะ dev)
    if (process.env.NODE_ENV !== 'production') {
      const config = new DocumentBuilder()
        .setTitle('IT Repair Ticketing System API')
        .setVersion('1.0.0')
        .addBearerAuth()
        .build();

      const document = SwaggerModule.createDocument(app, config);
      SwaggerModule.setup('api/docs', app, document);
    }

    await app.init();
  }
  return app;
}

// Vercel handler
export default async (req: Request, res: Response) => {
  const nestApp = await createApp();
  const server = nestApp.getHttpAdapter().getInstance();
  server(req, res);
};

// Local debug (optional)
if (require.main === module) {
  createApp().then(() => {
    new Logger('Bootstrap').log('App initialized for Vercel');
  });
}
