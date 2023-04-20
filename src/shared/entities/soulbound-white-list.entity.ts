import { Column, Entity, Unique } from 'typeorm';
import { BaseEntityIncrementId } from './base/base.entity';

@Entity('soulbound_white_list')
@Unique(['account_address'])
export class SoulboundWhiteList extends BaseEntityIncrementId {
  @Column()
  account_address: string;
}
