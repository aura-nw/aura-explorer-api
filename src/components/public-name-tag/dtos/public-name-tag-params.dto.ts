import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Min, Max } from 'class-validator';
import { PAGE_REQUEST } from '../../../shared';
import { Transform } from 'class-transformer';

export class PublicNameTagParamsDto {
  @ApiPropertyOptional({
    description: `Optional, defaults to 20`,
    default: 20,
    type: Number,
  })
  @Transform(({ value }) => parseInt(value, 0), { toClassOnly: true })
  @Min(PAGE_REQUEST.MIN)
  @Max(PAGE_REQUEST.MAX)
  limit: number;

  @ApiProperty({ default: 0 })
  offset: number;

  @ApiPropertyOptional({ default: '' })
  keyword: string;
}
