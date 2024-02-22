import { ApiPropertyOptional } from '@nestjs/swagger';

export class AssetsTokenMarketParamsDto {
  @ApiPropertyOptional({
    description: `Optional denom to search token market`,
    type: String,
    default: '',
  })
  denom: string;
}
