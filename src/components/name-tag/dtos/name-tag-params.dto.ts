import { ApiProperty } from '@nestjs/swagger';
import { Min, Max } from 'class-validator';

export class NameTagParamsDto {
  @ApiProperty({ default: 20 })
  @Min(0)
  @Max(100)
  limit: number;

  @ApiProperty({ default: 0 })
  @Min(0)
  offset: number;

  @ApiProperty({ default: '' })
  keyword: string;
}
