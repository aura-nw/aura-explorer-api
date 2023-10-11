import { Column, Entity } from 'typeorm';
import { BaseEntityIncrementId } from './base/base.entity';

@Entity('notification')
export class Notification extends BaseEntityIncrementId {
  @Column()
  address: string;

  @Column({ name: 'user_id' })
  userId: number;

  @Column()
  height: number;

  @Column()
  type: string;

  @Column()
  content: string;
}
