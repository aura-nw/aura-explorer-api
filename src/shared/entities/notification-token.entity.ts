import { Column, Entity } from 'typeorm';
import { BaseEntityIncrementId } from './base/base.entity';

@Entity('notification_token')
export class NotificationToken extends BaseEntityIncrementId {
  @Column()
  user_id: number;

  @Column()
  notification_token: string;
}
