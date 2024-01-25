import { Column, Entity } from 'typeorm';
import { BaseEntityIncrementId } from './base/base.entity';

@Entity('explorer')
export class Explorer extends BaseEntityIncrementId {
  @Column({ name: 'chain_id' })
  chainId: string;

  @Column()
  name: string;

  @Column({ name: 'address_prefix' })
  addressPrefix: string;

  @Column({ name: 'chain_db' })
  chainDb: string;
}
