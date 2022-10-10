import { ApiProperty } from '@nestjs/swagger';
import { Max, Min } from 'class-validator';
import { PAGE_REQUEST } from 'src/shared';

export class ContractParamsDto {
  @ApiProperty({ default: 20 })
  @Min(PAGE_REQUEST.MIN)
  @Max(PAGE_REQUEST.MAX)
  limit: number;

  @ApiProperty({ default: 0 })
  @Min(0)
  offset: number;

  @ApiProperty({ default: '' })
  keyword: string;
}
