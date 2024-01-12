import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntityIncrementId } from './base/base.entity';
import { TokenMarkets } from './token-markets.entity';

@Entity('token_holder_statistic')
export class TokenHolderStatistic extends BaseEntityIncrementId {
  @Column({ nullable: true, name: 'total_holder' })
  totalHolder: number;

  @ManyToOne(
    () => TokenMarkets,
    (tokenMarket) => tokenMarket.tokenHolderStatistics,
  )
  @JoinColumn({
    name: 'token_market_id',
  })
  tokenMarket: TokenMarkets;
}
