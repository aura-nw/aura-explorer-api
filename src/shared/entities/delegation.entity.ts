import { Column, Entity, Unique } from 'typeorm';

import { BaseEntityIncrementId } from './base/base.entity';

@Entity('delegations')
export class Delegation extends BaseEntityIncrementId {
  @Unique('delegator_address', ['delegator_address'])
  @Column()
  delegator_address: string;

  @Column({ default: '' })
  validator_address: string;

  @Column({ default: '' })
  shares: string;

  @Column({ type: 'float' })
  amount: number;
}
