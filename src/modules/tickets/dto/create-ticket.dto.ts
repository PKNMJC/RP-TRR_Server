import { IsString, IsNotEmpty, IsEnum, IsOptional, Length, Matches, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum TicketPriority {
  NORMAL = 'normal',
  URGENT = 'urgent',
  CRITICAL = 'critical',
}

export enum TicketCategory {
  HARDWARE = 'hardware',
  SOFTWARE = 'software',
  NETWORK = 'network',
  PERIPHERAL = 'peripheral',
  EMAIL = 'email',
  ACCOUNT = 'account',
  OTHER = 'other',
}

export class CreateTicketDto {
  @ApiProperty({ example: 'U1234567890abcdef' })
  @IsString()
  @IsNotEmpty()
  lineUserId!: string;

  @ApiProperty({ example: 'ปอนด์' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 50)
  nickname!: string;

  @ApiProperty({ example: 'uuid-of-department' })
  @IsUUID()
  @IsNotEmpty()
  departmentId!: string;

  @ApiProperty({ example: '0812345678', required: false })
  @IsOptional()
  @IsString()
  @Matches(/^[0-9]{10}$|^[0-9]{3}-[0-9]{3}-[0-9]{4}$/, {
    message: 'Phone number must be 10 digits or format: 081-234-5678',
  })
  phone?: string;

  @ApiProperty({ example: 'อาคาร A' })
  @IsString()
  @IsNotEmpty()
  locationBuilding!: string;

  @ApiProperty({ example: 'ชั้น 2' })
  @IsString()
  @IsNotEmpty()
  locationFloor!: string;

  @ApiProperty({ example: 'ห้อง 201' })
  @IsString()
  @IsNotEmpty()
  locationRoom!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  locationDetail?: string;

  @ApiProperty({ enum: TicketCategory })
  @IsEnum(TicketCategory)
  category!: TicketCategory;

  @ApiProperty({ example: 'คอมพิวเตอร์เปิดไม่ติด' })
  @IsString()
  @IsNotEmpty()
  @Length(10, 100)
  issueTitle!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @Length(0, 500)
  issueDescription?: string;

  @ApiProperty({ enum: TicketPriority, default: TicketPriority.NORMAL })
  @IsEnum(TicketPriority)
  priority: TicketPriority = TicketPriority.NORMAL;
}
