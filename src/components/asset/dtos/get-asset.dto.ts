import { ApiProperty } from '@nestjs/swagger';
import { ASSETS_TYPE } from 'src/shared';
import { TokenHolderStatistic } from '../../../shared/entities/token-holder-statistic.entity';

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
    example: [
      {
        created_at: '2024-02-20T23:20:44.112Z',
        updated_at: '2024-02-20T23:22:56.220Z',
        id: 122,
        totalHolder: 28687,
      },
      {
        created_at: '2024-02-20T23:20:44.112Z',
        updated_at: '2024-02-20T23:22:56.321Z',
        id: 127,
        totalHolder: 28687,
      },
    ],
  })
  holders: TokenHolderStatistic[];
}

export class GetAssetResult {
  @ApiProperty({ type: AssetAttributes, isArray: true })
  data: AssetAttributes[];
}
