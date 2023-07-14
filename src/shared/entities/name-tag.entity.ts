import {
  Column,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { BaseEntityIncrementId } from './base/base.entity';
import { VIEW_TYPE, NAME_TAG_TYPE } from '../constants/common';
import { User } from './user.entity';

@Entity('name_tag')
@Index(['address', 'created_by', 'view_type'], { unique: true })
export class NameTag extends BaseEntityIncrementId {
  @Column()
  type: NAME_TAG_TYPE;

  @Column({ length: 35, default: null, nullable: true, name: 'name_tag' })
  name_tag: string;

  @Column()
  address: string;

  @Column({ name: 'view_type' })
  view_type: VIEW_TYPE;

  @Column({ length: 500, default: null, nullable: true })
  note: string;

  @Column({ name: 'created_by' })
  created_by: number;

  @Column({ name: 'updated_by' })
  updated_by: number;

  @ManyToOne(() => User, (user) => user.name_tags)
  @JoinColumn({ name: 'created_by' })
  user: User;

  @DeleteDateColumn({ type: 'timestamp', nullable: true })
  deleted_at: Date;

  @Column({ nullable: true, name: 'enterprise_url' })
  enterpriseUrl: string;
}
