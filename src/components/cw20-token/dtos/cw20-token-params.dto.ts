import { ApiProperty } from '@nestjs/swagger';
import { Min, Max } from 'class-validator';

export class Cw20TokenParamsDto {
  @ApiProperty({ default: 20 })
  @Min(0)
  @Max(100)
  limit: number;

  @ApiProperty({ default: 0 })
  @Min(0)
  offset: number;

  @ApiProperty({ default: '' })
  keyword: string;

  @ApiProperty({ default: 'circulating_market_cap' })
  sort_column: string;

  @ApiProperty({ default: 'desc' })
  sort_order: string;
}
