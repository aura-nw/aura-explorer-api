import { Column, Entity } from 'typeorm';
import { BaseEntityIncrementId } from './base/base.entity';

@Entity('users')
export class User extends BaseEntityIncrementId {
  @Column('text')
  email: string;

  @Column('text')
  provider: string;
}
