import {
  IsString,
  IsNumber,
  IsEnum,
  IsOptional,
  IsObject,
} from 'class-validator';

export enum HookidEventType {
  MESSAGE = 'message',
  POSTBACK = 'postback',
  FOLLOW = 'follow',
  UNFOLLOW = 'unfollow',
}

export class HookidEventDataDto {
  @IsOptional()
  @IsString()
  message?: string;

  @IsOptional()
  @IsString()
  postbackData?: string;

  @IsOptional()
  @IsString()
  linkToken?: string;
}

export class HookidPayloadDto {
  @IsString()
  eventId: string;

  @IsEnum(HookidEventType)
  type: HookidEventType;

  @IsString()
  userId: string;

  @IsNumber()
  timestamp: number;

  @IsObject()
  data: HookidEventDataDto;
}

export class HookidWebhookResponseDto {
  status: 'received' | 'processed' | 'error';
  message: string;
  referenceId: string;
}

export class HookidEventStatusDto {
  eventId?: string;
  referenceId?: string | null;
  status: string;
  processedAt?: Date | null;
  errorMessage?: string | null;
  retryCount: number;
}
