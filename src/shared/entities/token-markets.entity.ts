import { Column, Entity, Index, Unique } from 'typeorm';
import { BaseEntityIncrementId } from './base/base.entity';

@Entity('token_markets')
@Unique(['contract_address'])
@Index(['chain_id', 'denom'], { unique: true })
export class TokenMarkets extends BaseEntityIncrementId {
  @Column({ name: 'contract_address' })
  @Index()
  contract_address: string;

  @Column({ name: 'coin_id' })
  coin_id: string;

  @Column()
  symbol: string;

  @Column()
  name: string;

  @Column()
  image: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ name: 'verify_status', nullable: true })
  verify_status: string;

  @Column({ name: 'verify_text', nullable: true })
  verify_text: string;

  @Column({ name: 'denom', nullable: true })
  denom: string;

  @Column({ name: 'decimal', default: 0 })
  decimal: number;

  @Column({ name: 'chain_id', nullable: true })
  chain_id: string;
}
