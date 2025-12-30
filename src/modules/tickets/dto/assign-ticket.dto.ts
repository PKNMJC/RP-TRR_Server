import { IsUUID, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AssignTicketDto {
  @ApiProperty({ example: 'admin-uuid' })
  @IsUUID()
  @IsNotEmpty()
  assignedTo!: string;
}
