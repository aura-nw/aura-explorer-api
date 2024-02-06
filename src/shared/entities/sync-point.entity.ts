import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntityIncrementId } from './base/base.entity';
import { SYNC_POINT_TYPE } from '../constants/common';
import { Explorer } from './explorer.entity';

@Entity('sync_point')
export class SyncPoint extends BaseEntityIncrementId {
  @Column({ nullable: true })
  type: SYNC_POINT_TYPE;

  @Column({ nullable: true })
  point: number;

  @ManyToOne(() => Explorer, (explorer) => explorer.syncPoints)
  @JoinColumn({
    name: 'explorer_id',
  })
  explorer: Explorer;
}
