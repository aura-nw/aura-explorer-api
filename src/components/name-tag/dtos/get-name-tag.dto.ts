import { ApiPropertyOptional } from '@nestjs/swagger';

export class GetNameTagDto {
  @ApiPropertyOptional({
    description: `Optional, defaults to 200`,
    default: 200,
    type: Number,
  })
  limit: number;

  @ApiPropertyOptional({
    description: `If only one value is provided get name tag approximately. If many then get by exactly address.`,
    type: String,
    isArray: true,
    default: [],
  })
  keyword: string[];

  @ApiPropertyOptional({
    description: `Optional key to get next data`,
    type: Number,
  })
  nextKey: number;
}
