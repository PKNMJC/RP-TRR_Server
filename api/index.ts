import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

let app;

export default async (req: any, res: any) => {
  // Create app once and reuse for subsequent requests
  if (!app) {
    app = await NestFactory.create(AppModule);
    await app.init();
  }

  // Use Express app to handle the request
  const expressInstance = app.getHttpAdapter().getInstance();
  expressInstance(req, res);
};
