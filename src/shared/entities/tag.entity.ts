import { Column, Entity, Unique } from 'typeorm';
import { BaseEntityIncrementId } from './base/base.entity';

@Entity('tags')
@Unique(['account_address', 'contract_address'])
export class Tag extends BaseEntityIncrementId {
  @Column({ update: false })
  account_address: string;

  @Column({ update: false })
  contract_address: string;

  @Column()
  tag: string;

  @Column()
  note: string;
}
