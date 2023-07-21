import { Column, Entity, Unique } from 'typeorm';
import { BaseEntityIncrementId } from './base/base.entity';

@Entity('cw20_token_owners')
@Unique(['contract_address', 'owner'])
export class Cw20TokenOwner extends BaseEntityIncrementId {
  @Column()
  contract_address: string;

  @Column()
  owner: string;

  @Column()
  balance: number;

  @Column()
  percent_hold: number;
}
