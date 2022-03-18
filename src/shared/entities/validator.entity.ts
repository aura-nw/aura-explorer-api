import { json } from 'stream/consumers';
import { Column, Entity, Unique } from 'typeorm';

import { BaseEntityIncrementId } from './base/base.entity';

@Entity('validators')
export class Validator extends BaseEntityIncrementId {
  @Unique('operator_address', ['operator_address'])
  @Column()
  operator_address: string;

  @Column({ default: '' })
  acc_address: string;

  @Column({ default: '' })
  title: string;

  @Column({ default: '' })
  jailed: string;

  @Column({ type: 'text' })
  commission: string;

  @Column({ type: 'float' })
  power: number;

  @Column({ default: '' })
  percent_power: string;

  @Column({ default: '' })
  website: string;

  @Column({ default: '' })
  details: string;

  @Column({ default: 0 })
  up_time: string;
}
