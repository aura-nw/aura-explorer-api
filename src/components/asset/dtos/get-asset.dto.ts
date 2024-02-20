import { ApiProperty } from '@nestjs/swagger';
import { ASSETS_TYPE } from 'src/shared';

export class AssetAttributes {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Aura serenity testnet (AURA)' })
  name: string;

  @ApiProperty({ example: 'NATIVE' })
  type: ASSETS_TYPE;

  @ApiProperty({
    example: 0.04092,
  })
  currentPrice: number;

  @ApiProperty({
    example: 10000000,
  })
  totalSupply: number;

  @ApiProperty({
    example: 223,
  })
  holders: number;
}

export class GetAssetResult {
  @ApiProperty({ type: AssetAttributes, isArray: true })
  data: AssetAttributes[];
}
