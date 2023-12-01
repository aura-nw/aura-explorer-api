import { ApiPropertyOptional } from '@nestjs/swagger';

export class Cw20TokenMarketParamsDto {
  @ApiPropertyOptional({
    description: `Optional contract address to search token market`,
    type: String,
    default: '',
  })
  contractAddress: string;

  @ApiPropertyOptional({
    description: `Optional get ibc token or all.`,
    type: Boolean,
    default: false,
  })
  onlyIbc: string;
}
