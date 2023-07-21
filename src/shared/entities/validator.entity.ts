import { Column, Entity, PrimaryColumn } from 'typeorm';

import { BaseEntity } from './base/base.entity';

@Entity('validators')
export class Validator extends BaseEntity {
  @PrimaryColumn({ name: 'operator_address', type: 'varchar' })
  operator_address: string;

  @Column({ default: '' })
  acc_address: string;

  @Column({ default: '' })
  cons_address: string;

  @Column({ default: '' })
  cons_pub_key: string;

  @Column({ default: '' })
  title: string;

  @Column({ default: false })
  jailed: boolean;

  @Column({ type: 'text' })
  commission: string;

  @Column({ type: 'text' })
  max_commission: string;

  @Column({ type: 'text' })
  max_change_rate: string;

  @Column({ default: 0 })
  min_self_delegation: number;

  @Column({ type: 'text' })
  delegator_shares: string;

  @Column({ type: 'double' })
  power: number;

  @Column({ default: '' })
  percent_power: string;

  @Column({ type: 'double' })
  self_bonded: number;

  @Column({ default: '' })
  percent_self_bonded: string;

  @Column({ default: '' })
  website: string;

  @Column({ nullable: true, type: 'text' })
  details: string;

  @Column({ default: '' })
  identity: string;

  @Column({ default: '' })
  unbonding_height: string;

  @Column()
  unbonding_time: Date;

  @Column()
  update_time: Date;

  @Column({ default: 0 })
  up_time: string;

  @Column({ default: 0 })
  status: number;

  @Column({ name: 'image_url', nullable: true, type: 'nvarchar' })
  image_url: string;

  @Column({ name: 'voting_power_level', nullable: true })
  voting_power_level: string;

  @Column({ name: 'bonded_height', default: 1 })
  bonded_height: number;
}
