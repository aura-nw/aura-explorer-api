import { Column, Entity, Unique } from 'typeorm';
import { BaseEntityIncrementId } from './base/base.entity';

@Entity('chain_info')
@Unique(['chainId'])
export class ChainInfo extends BaseEntityIncrementId {
  @Column({ name: 'chain_id', nullable: false })
  chainId: string;

  @Column({ name: 'chain_name', nullable: false })
  chainName: string;

  @Column({ name: 'chain_image', nullable: false })
  chainImage: string;
}
