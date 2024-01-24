import { Column, Entity } from 'typeorm';
import { BaseEntityIncrementId } from './base/base.entity';

@Entity('explorer')
export class Explorer extends BaseEntityIncrementId {
  @Column({ name: 'chain_id' })
  chainId: string;

  @Column()
  name: string;
}
