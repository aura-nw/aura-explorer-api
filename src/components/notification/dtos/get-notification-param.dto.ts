import { ApiPropertyOptional } from '@nestjs/swagger';

export class NotificationParamsDto {
  @ApiPropertyOptional({ default: false })
  unread: boolean;
}
