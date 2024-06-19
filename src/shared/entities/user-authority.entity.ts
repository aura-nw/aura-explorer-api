import { Column, Entity } from 'typeorm';
import { BaseEntityIncrementId } from './base/base.entity';

@Entity('user_authority')
export class UserAuthority extends BaseEntityIncrementId {
  @Column({ name: 'user_id', nullable: false })
  userId: number;

  @Column({ name: 'explorer_id', nullable: false })
  explorerId: number;
}
