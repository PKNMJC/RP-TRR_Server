import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { INestApplication } from '@nestjs/common';
import { AppModule } from './app.module';

// For Vercel Serverless deployment
// Local development should use main-local.ts

export let app: INestApplication;

async function createApp() {
  if (!app) {
    app = await NestFactory.create(AppModule);
    await app.init();
  }
  return app;
}

export default async (req: any, res: any) => {
  const nestApp = await createApp();
  const expressApp = nestApp.getHttpAdapter().getInstance();
  expressApp(req, res);
};

// Allow bootstrapping for local testing
if (require.main === module) {
  createApp().then(() => {
    const logger = new Logger('Bootstrap');
    logger.log('App initialized for Vercel');
  });
}
