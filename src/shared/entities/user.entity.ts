import { Column, Entity } from 'typeorm';
import { BaseEntityIncrementId } from './base/base.entity';

@Entity('users')
export class User extends BaseEntityIncrementId {
  @Column({ nullable: false, type: 'text' })
  email: string;

  @Column({ nullable: false, type: 'text' })
  provider: string;

  @Column({ nullable: false, type: 'text' })
  username: string;
}
