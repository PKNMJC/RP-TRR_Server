import { IsOptional, IsEnum, IsUUID, IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TicketPriority } from './create-ticket.dto';

export class UpdateTicketDto {
  @ApiProperty({ enum: ['pending', 'in_progress', 'completed', 'cancelled'], required: false })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  assignedTo?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @Length(0, 500)
  comment?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  cancellationReason?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  notifyUser?: boolean;
}
