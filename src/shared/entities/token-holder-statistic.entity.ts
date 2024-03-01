import { Column, Entity, JoinColumn, ManyToOne, Unique } from 'typeorm';
import { BaseEntityIncrementId } from './base/base.entity';
import { TokenMarkets } from './token-markets.entity';
import { Asset } from './asset.entity';

@Entity('token_holder_statistic')
@Unique('asset_id_date', ['asset', 'date'])
export class TokenHolderStatistic extends BaseEntityIncrementId {
  @Column({ nullable: true, name: 'total_holder' })
  totalHolder: number;

  @Column({ nullable: true, name: 'date', type: 'date' })
  date: Date;

  @ManyToOne(
    () => TokenMarkets,
    (tokenMarket) => tokenMarket.tokenHolderStatistics,
  )
  @JoinColumn({
    name: 'token_market_id',
  })
  tokenMarket: TokenMarkets;

  @ManyToOne(() => Asset, (asset) => asset.tokenHolderStatistics)
  @JoinColumn({
    name: 'asset_id',
  })
  asset: Asset;
}
