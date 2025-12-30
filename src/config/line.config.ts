import { registerAs } from '@nestjs/config';

export const lineConfig = registerAs('line', () => ({
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN || '',
  channelSecret: process.env.LINE_CHANNEL_SECRET || '',
  liffId: process.env.LINE_LIFF_ID || '',
  notifyToken: process.env.LINE_NOTIFY_TOKEN || '',
}));
