import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntityIncrementId } from './base/base.entity';
import { NotificationToken } from './notification-token.enitity';

@Entity('notification')
export class Notification extends BaseEntityIncrementId {
  @JoinColumn({ name: 'notification_token_id', referencedColumnName: 'id' })
  @ManyToOne(() => NotificationToken)
  notification_token: NotificationToken;

  @Column()
  userId: number;

  @Column()
  type: string;

  @Column()
  content: string;

  @Column()
  is_read: boolean;
}
