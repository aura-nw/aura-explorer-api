import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNumber, IsOptional, Max, Min } from 'class-validator';
import { PAGE_REQUEST } from '../../../shared';

export class TokenParasDto {
  @ApiProperty()
  contractAddress: string;

  @ApiPropertyOptional({
    description: `Optional, defaults to ${PAGE_REQUEST.MAX}`,
    type: Number,
  })
  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 0), { toClassOnly: true })
  @Min(0)
  @Max(PAGE_REQUEST.MAX)
  limit: number = PAGE_REQUEST.MAX;

  @ApiProperty({ default: 0 })
  offset: number;

  @ApiPropertyOptional({ default: '' })
  keyword: string;

  @ApiPropertyOptional({ default: '' })
  status: string;
}
