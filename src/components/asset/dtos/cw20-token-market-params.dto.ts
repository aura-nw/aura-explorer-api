import { ApiPropertyOptional } from '@nestjs/swagger';
import { ASSETS_TYPE } from 'src/shared';

export class AssetsTokenMarketParamsDto {
  @ApiPropertyOptional({
    description: `Optional denom to search token market`,
    type: String,
    default: '',
  })
  denom: string;

  @ApiPropertyOptional({
    default: '',
    example: `${ASSETS_TYPE.IBC},${ASSETS_TYPE.NATIVE}`,
  })
  type: string;
}
