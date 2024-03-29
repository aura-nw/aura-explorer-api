import { Column, DeleteDateColumn, Entity, Unique } from 'typeorm';
import { BaseEntityIncrementId } from './base/base.entity';
import { NAME_TAG_TYPE } from '../constants/common';

@Entity('name_tag')
@Unique(['name_tag'])
@Unique(['address'])
export class NameTag extends BaseEntityIncrementId {
  @Column()
  type: NAME_TAG_TYPE;

  @Column()
  name_tag: string;

  @Column()
  address: string;

  @Column()
  updated_by: number;

  @DeleteDateColumn({ type: 'timestamp', nullable: true })
  deleted_at: Date;

  @Column({ nullable: true, name: 'enterprise_url' })
  enterpriseUrl: string;
}
