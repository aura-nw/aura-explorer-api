import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntityIncrementId } from './base/base.entity';
import { NOTIFICATION } from '../constants';
import { User } from './user.entity';

@Entity('notification_token')
export class NotificationToken extends BaseEntityIncrementId {
  @ManyToOne(() => User, (user) => user.notificationTokens)
  @JoinColumn({
    name: 'user_id',
  })
  user: User;

  @Column()
  notification_token: string;

  @Column({
    default: NOTIFICATION.STATUS.ACTIVE,
  })
  status: string;
}
