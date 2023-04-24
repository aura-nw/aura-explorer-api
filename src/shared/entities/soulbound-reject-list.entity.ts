import { Column, Entity } from 'typeorm';
import { BaseEntityIncrementId } from './base/base.entity';

@Entity('soulbound_reject_list')
export class SoulboundRejectList extends BaseEntityIncrementId {
  @Column()
  account_address: string;

  @Column()
  reject_address: string;
}
