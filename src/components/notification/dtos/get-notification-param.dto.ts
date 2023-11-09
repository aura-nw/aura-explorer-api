import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { Max, Min } from 'class-validator';
import { PAGE_REQUEST } from '../../../shared/constants/common';

export class NotificationParamsDto {
  @ApiPropertyOptional({ default: false })
  unread: boolean;

  @ApiPropertyOptional({
    description: `Optional, defaults to 100`,
    default: 100,
    type: Number,
  })
  @Transform(({ value }) => parseInt(value, 0), { toClassOnly: true })
  @Min(PAGE_REQUEST.MIN)
  @Max(PAGE_REQUEST.MAX_500)
  limit: number;

  @ApiProperty({ default: 0 })
  offset: number;
}
