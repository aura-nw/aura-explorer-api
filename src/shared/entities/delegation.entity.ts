import { Column, Entity, Unique } from 'typeorm';

import { BaseEntityIncrementId } from './base/base.entity';

@Entity('delegations')
export class Delegation extends BaseEntityIncrementId {
  @Column()
  delegator_address: string;

  @Column({ default: '' })
  validator_address: string;

  @Column({ default: '' })
  shares: string;

  @Column({ type: 'float' })
  amount: number;

  @Unique('tx_hash', ['tx_hash'])
  @Column()
  tx_hash: string;

  @Column()
  type: string;
}
