import { Column, Entity } from 'typeorm';
import { BaseEntityIncrementId } from './base/base.entity';
import { SYNC_POINT_TYPE } from '../constants/common';

@Entity('sync_point')
export class SyncPoint extends BaseEntityIncrementId {
  @Column({ nullable: true })
  type: SYNC_POINT_TYPE;

  @Column({ nullable: true })
  point: number;
}
