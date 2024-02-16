import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { BaseEntityIncrementId } from './base/base.entity';
import { Explorer } from './explorer.entity';
import { TokenHolderStatistic } from './token-holder-statistic.entity';

@Entity('asset')
@Index(['denom', 'explorer'], { unique: true })
export class Asset extends BaseEntityIncrementId {
  @Column({ name: 'coin_id' })
  coinId: string;

  @Column()
  symbol: string;

  @Column()
  name: string;

  @Column()
  image: string;

  @Column({
    name: 'current_price',
    type: 'decimal',
    precision: 38,
    scale: 6,
    default: 0,
  })
  currentPrice: number;

  @Column({
    name: 'price_change_percentage_24h',
    type: 'float',
    default: 0,
  })
  priceChangePercentage24h: number;

  @Column({ name: 'verify_status', nullable: true })
  verifyStatus: string;

  @Column({ name: 'verify_text', nullable: true })
  verifyText: string;

  @Column({ name: 'denom', nullable: true })
  denom: string;

  @Column({ name: 'decimal', default: 0 })
  decimal: number;

  @Column({ name: 'chain_id', nullable: true })
  chainId: string;

  @Column({ name: 'official_site', nullable: true })
  officialSite: string;

  @Column({ name: 'social_profiles', nullable: true, type: 'json' })
  socialProfiles: JSON;

  @Column({ name: 'type' })
  type: string;

  @Column({
    name: 'total_supply',
    type: 'decimal',
    precision: 38,
    scale: 6,
    default: 0,
  })
  totalSupply: number;

  @OneToMany(
    () => TokenHolderStatistic,
    (tokenHolderStatistic) => tokenHolderStatistic.asset,
  )
  tokenHolderStatistics: TokenHolderStatistic[];

  @ManyToOne(() => Explorer, (explorer) => explorer.assets)
  @JoinColumn({
    name: 'explorer_id',
  })
  explorer: Explorer;
}
