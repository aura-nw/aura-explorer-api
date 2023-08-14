import { Column, Entity, OneToMany, Unique } from 'typeorm';
import { BaseEntityIncrementId } from './base/base.entity';
import { PROVIDER, USER_ROLE } from '../constants/common';
import { UserActivity } from './user-activity.entity';

@Entity('user')
@Unique(['email'])
export class User extends BaseEntityIncrementId {
  @Column()
  email: string;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  role: USER_ROLE;

  @Column({ nullable: true })
  provider: PROVIDER;

  @Column({ nullable: true, name: 'encrypted_password' })
  encryptedPassword: string;

  @Column({ nullable: true, name: 'verification_token' })
  verificationToken: string;

  @Column({ nullable: true, name: 'verified_at' })
  verifiedAt: Date;

  @Column({ nullable: true, name: 'reset_password_token' })
  resetPasswordToken: string;

  @OneToMany(() => UserActivity, (userActivity) => userActivity.user, {
    cascade: true,
  })
  userActivities: UserActivity[];

  @Column({ nullable: true, name: 'last_required_login' })
  lastRequiredLogin: Date;
}
