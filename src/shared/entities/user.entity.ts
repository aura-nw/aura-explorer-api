import { Column, Entity, OneToMany, Unique } from 'typeorm';
import { BaseEntityIncrementId } from './base/base.entity';
import { PROVIDER, USER_ROLE } from '../constants/common';
import { NameTag } from './name-tag.entity';
import { UserActivity } from './user-activity.entity';

@Entity('user')
@Unique(['email'])
export class User extends BaseEntityIncrementId {
  @Column()
  email: string;

  @Column({ nullable: true })
  name: string;

  @Column()
  role: USER_ROLE;

  @Column()
  provider: PROVIDER;

  @OneToMany(() => NameTag, (name_tag) => name_tag.user)
  name_tags: NameTag[];

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
}
