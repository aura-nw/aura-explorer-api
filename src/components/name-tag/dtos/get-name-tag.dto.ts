import { ApiPropertyOptional } from '@nestjs/swagger';

export class GetNameTagDto {
  @ApiPropertyOptional({
    description: `Optional, defaults to 200`,
    default: 200,
    type: Number,
  })
  limit: number;

  @ApiPropertyOptional({
    description: `Optional keyword to search exactly name tag`,
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
