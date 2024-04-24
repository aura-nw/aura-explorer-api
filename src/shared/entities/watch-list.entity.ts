import { Column, Entity, Index, JoinColumn, ManyToOne, Unique } from 'typeorm';
import { BaseEntityIncrementId } from './base/base.entity';
import { User } from './user.entity';
import { WATCH_LIST } from '../constants/common';
import { Explorer } from './explorer.entity';

@Entity('watch_list')
@Index(['address', 'user'], { unique: true })
export class WatchList extends BaseEntityIncrementId {
  @Column({ nullable: false })
  address: string;

  @Column({ name: 'evm_address', nullable: true })
  evmAddress: string;

  @Column({ type: 'enum', enum: WATCH_LIST.TYPE })
  type: string;

  @Column({ default: false })
  favorite: boolean;

  @Column({ default: false })
  tracking: boolean;

  @Column({ length: WATCH_LIST.NOTE_MAX_LENGTH, nullable: true, default: '' })
  note: string;

  @Column({ type: 'json', nullable: true })
  settings: JSON;

  @ManyToOne(() => User, (user) => user.watchLists)
  @JoinColumn({
    name: 'user_id',
  })
  user: User;

  @ManyToOne(() => Explorer, (explorer) => explorer.watchLists)
  @JoinColumn({
    name: 'explorer_id',
  })
  explorer: Explorer;
}
