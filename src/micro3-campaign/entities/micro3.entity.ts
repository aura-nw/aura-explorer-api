import { Column, Entity } from 'typeorm';
import { HALO_ACTION_TYPE } from '../const/common';
import { BaseEntityIncrementId } from '../../shared/entities/base/base.entity';

@Entity('halo_trade_activity')
export class HaloTradeActivity extends BaseEntityIncrementId {
  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  action: HALO_ACTION_TYPE;

  @Column({ nullable: true, name: 'pool_address' })
  poolAddress: string;

  @Column({ name: 'tx_hash', unique: true })
  txHash: string;
}
