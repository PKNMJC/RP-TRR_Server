// Register tsconfig paths at runtime
import 'tsconfig-paths/register';

import { NestFactory } from '@nestjs/core';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module';

let app: INestApplication;

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
