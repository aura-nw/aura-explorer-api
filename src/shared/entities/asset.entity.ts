import { Column, Entity, OneToMany, Unique } from 'typeorm';
import { BaseEntityIncrementId } from './base/base.entity';
import { TokenHolderStatistic } from './token-holder-statistic.entity';

@Entity('asset')
@Unique(['denom'])
export class Asset extends BaseEntityIncrementId {
  @Column({ name: 'coin_id', nullable: true, default: '' })
  coinId: string;

  @Column({ nullable: true })
  symbol: string;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  image: string;

  @Column({
    name: 'current_price',
    type: 'decimal',
    precision: 38,
    scale: 6,
    default: 0,
    nullable: true,
  })
  currentPrice: number;

  @Column({
    name: 'price_change_percentage_24h',
    type: 'float',
    default: 0,
    nullable: true,
  })
  priceChangePercentage24h: number;

  @Column({ name: 'verify_status', nullable: true })
  verifyStatus: string;

  @Column({ name: 'verify_text', nullable: true })
  verifyText: string;

  @Column({ name: 'denom', nullable: true })
  denom: string;

  @Column({ name: 'decimal', default: 0, nullable: true })
  decimal: number;

  @Column({ name: 'official_site', nullable: true })
  officialSite: string;

  @Column({ name: 'social_profiles', nullable: true, type: 'json' })
  socialProfiles: JSON;

  @Column({ name: 'type', nullable: true })
  type: string;

  @Column({
    name: 'total_supply',
    type: 'decimal',
    precision: 60,
    scale: 6,
    default: 0,
    nullable: true,
  })
  totalSupply: number;

  @Column({
    name: 'total_volume',
    type: 'decimal',
    precision: 38,
    scale: 6,
    default: 0,
  })
  totalVolume: number;

  @Column({
    name: 'market_cap',
    type: 'decimal',
    precision: 38,
    scale: 6,
    default: 0,
  })
  marketCap: number;

  @OneToMany(
    () => TokenHolderStatistic,
    (tokenHolderStatistic) => tokenHolderStatistic.asset,
  )
  tokenHolderStatistics: TokenHolderStatistic[];
}
