import { BeforeInsert, Column, Entity, Unique } from 'typeorm';
import { BaseEntityIncrementId } from './base/base.entity';
import { PROVIDER, USER_ROLE } from '../constants/common';
import * as bcrypt from 'bcrypt';

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

  @Column({ nullable: true, name: 'confirmation_token' })
  confirmationToken: string;

  @Column({ nullable: true, name: 'confirmed_at' })
  confirmedAt: Date;

  @Column({ nullable: true, name: 'user_name', unique: true })
  userName: string;
}
