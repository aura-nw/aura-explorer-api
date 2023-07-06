import { ApiPropertyOptional } from '@nestjs/swagger';

export class Cw20TokenMarketParamsDto {
  @ApiPropertyOptional({
    description: `Optional contract address to search token market`,
    type: String,
    isArray: true,
    default: [],
  })
  contractAddress: string[];
}
