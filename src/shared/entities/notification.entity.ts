import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntityIncrementId } from './base/base.entity';
import { Explorer } from './explorer.entity';

@Entity('notification')
export class Notification extends BaseEntityIncrementId {
  @Column()
  title: string;

  @Column({ type: 'json', nullable: true })
  body: JSON;

  @Column({
    nullable: true,
  })
  image: string;

  @Column()
  tx_hash: string;

  @Column({
    nullable: true,
  })
  height: number;

  @Column()
  type: string;

  @Column()
  user_id: number;

  @Column({ default: false })
  is_read: boolean;

  @ManyToOne(() => Explorer, (explorer) => explorer.tokenMarkets)
  @JoinColumn({
    name: 'explorer_id',
  })
  explorer: Explorer;
}
