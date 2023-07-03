import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { USER_ACTIVITIES } from '../constants';
import { BaseEntityIncrementId } from './base/base.entity';
import { User } from './user.entity';

@Entity('user_activity')
export class UserActivity extends BaseEntityIncrementId {
  @Column()
  type: USER_ACTIVITIES;

  @Column({ nullable: true, default: 0, name: 'send_mail_attempt' })
  sendMailAttempt: number;

  @Column({ nullable: true, name: 'last_send_mail_attempt' })
  lastSendMailAttempt: Date;

  @ManyToOne(() => User, (user) => user.userActivities)
  @JoinColumn({
    name: 'user_id',
  })
  user: User;
}
