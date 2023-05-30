import { Column, Entity } from 'typeorm';
import { BaseEntityIncrementId } from './base/base.entity';

@Entity('refresh_token')
export class RefreshToken extends BaseEntityIncrementId {
  @Column({ nullable: true })
  refresh_token: string;

  @Column({ nullable: true })
  user_id: string;
}
