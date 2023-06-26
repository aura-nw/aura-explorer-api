import { Column, Entity, Unique } from 'typeorm';

import { BaseEntityIncrementId } from './base/base.entity';

@Entity('blocks')
export class Block extends BaseEntityIncrementId {
  @Unique('block_hash', ['block_hash'])
  @Column()
  block_hash: string;

  @Column({ default: '' })
  chainid: string;

  @Column()
  height: number;

  @Column({ default: '' })
  identity: string;

  @Column({ default: '' })
  moniker: string;

  @Column({ default: 0 })
  num_signatures: number;

  @Column({ default: 0 })
  num_txs: number;

  @Column({ default: '' })
  operator_address: string;

  @Column({ default: '' })
  proposer: string;

  @Column()
  timestamp: Date;

  @Column({
    name: 'gas_used',
    default: 0,
    type: 'bigint',
  })
  gas_used: number;

  @Column({
    name: 'gas_wanted',
    type: 'bigint',
    default: 0,
  })
  gas_wanted: number;

  @Column({ default: 0 })
  round: number;

  @Column({
    name: 'json_data',
    type: 'json',
    nullable: true,
  })
  json_data: any;
}
