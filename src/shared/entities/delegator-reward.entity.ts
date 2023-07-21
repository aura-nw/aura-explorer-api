import { Column, Entity, Unique } from 'typeorm';
import { BaseEntityIncrementId } from './base/base.entity';

@Entity('delegator_rewards')
@Unique(['tx_hash', 'delegator_address', 'validator_address'])
export class DelegatorReward extends BaseEntityIncrementId {
  @Column()
  delegator_address: string;

  @Column()
  validator_address: string;

  @Column()
  amount: number;

  @Column()
  tx_hash: string;
}
