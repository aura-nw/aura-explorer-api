import { Column, Entity } from 'typeorm';
import { BaseEntityIncrementId } from './base/base.entity';

@Entity('notification')
export class Notification extends BaseEntityIncrementId {
  @Column()
  title: string;

  @Column({ type: 'text' })
  body: string;

  @Column()
  token: string;

  @Column({
    nullable: true,
  })
  image: string;

  @Column()
  tx_hash: string;

  @Column()
  type: string;

  @Column()
  user_id: number;

  @Column({ name: 'is_notify', default: false })
  is_read: boolean;
}
