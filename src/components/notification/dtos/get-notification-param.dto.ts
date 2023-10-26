import { ApiPropertyOptional } from '@nestjs/swagger';

export class NotificationParamsDto {
  @ApiPropertyOptional({ default: '' })
  userId: number;

  @ApiPropertyOptional({ default: false })
  isRead: boolean;
}
