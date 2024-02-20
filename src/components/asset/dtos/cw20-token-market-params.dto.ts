import { ApiPropertyOptional } from '@nestjs/swagger';

export class AssetsTokenMarketParamsDto {
  @ApiPropertyOptional({
    description: `Optional denom to search token market`,
    type: String,
    default: '',
  })
  denom: string;

  @ApiPropertyOptional({
    description: `Optional get ibc token or all.`,
    type: Boolean,
    default: false,
  })
  onlyIbc: string;
}
