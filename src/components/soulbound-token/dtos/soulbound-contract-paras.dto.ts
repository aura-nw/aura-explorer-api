import { Optional } from '@nestjs/common';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNumber, IsOptional, Max, Min } from 'class-validator';
import { PAGE_REQUEST } from '../../../shared';

export class SoulboundContractParasDto {
  @ApiProperty()
  minterAddress: string;

  @ApiPropertyOptional({
    description: `Optional, defaults to ${PAGE_REQUEST.MAX}`,
    type: Number,
  })
  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 0), { toClassOnly: true })
  @Max(PAGE_REQUEST.MAX)
  limit = PAGE_REQUEST.MAX;

  @ApiProperty()
  offset: number;
}