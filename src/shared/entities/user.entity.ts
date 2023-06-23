import { Column, Entity, OneToMany, Unique } from 'typeorm';
import { BaseEntityIncrementId } from './base/base.entity';
import { PROVIDER, USER_ROLE } from '../constants/common';
import { NameTag } from './name-tag.entity';

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
}
