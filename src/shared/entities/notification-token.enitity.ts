import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntityIncrementId } from './base/base.entity';
import { User } from './user.entity';

@Entity('notification-token')
export class NotificationToken extends BaseEntityIncrementId {
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  @ManyToOne(() => User)
  userId: number;

  @Column()
  notification_token: string;

  @Column()
  status: string;
}
