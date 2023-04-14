import { Column, Entity, Unique } from 'typeorm';
import { BaseEntityIncrementId } from './base/base.entity';

@Entity('soulbound-white-list')
@Unique(['account_address'])
export class SoulboundWhiteList extends BaseEntityIncrementId {
  @Column()
  account_address: string;
}
