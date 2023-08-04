import { Column, Entity, Index } from 'typeorm';
import { BaseEntityIncrementId } from './base/base.entity';
import { NAME_TAG_TYPE } from '../constants/common';

@Entity('private_name_tag')
@Index(['address', 'created_by'], { unique: true })
export class PrivateNameTag extends BaseEntityIncrementId {
  @Column()
  type: NAME_TAG_TYPE;

  @Column()
  name_tag: string;

  @Column({ length: 500, default: null, nullable: true })
  note: string;

  @Column()
  address: string;

  @Column()
  created_by: number;
}
