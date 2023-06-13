import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { Max } from 'class-validator';
import { PAGE_REQUEST } from '../../../shared';

export class ContractByCreatorParamsDto {
  @ApiProperty()
  creatorAddress: string;

  @ApiPropertyOptional()
  codeId: number;

  @ApiPropertyOptional()
  status: string;

  @ApiProperty({
    type: 'number',
    description: 'Number records per page and maximum is 100',
  })
  @Transform(({ value }) => parseInt(value, 0), { toClassOnly: true })
  @Max(PAGE_REQUEST.MAX)
  limit: number;

  @ApiProperty()
  offset: number;
}
