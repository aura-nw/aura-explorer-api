import { Column, Entity } from 'typeorm';
import { BaseEntityIncrementId } from './base/base.entity';

@Entity('smart_contract_codes')
export class SmartContractCode extends BaseEntityIncrementId {
  @Column()
  code_id: number;

  @Column()
  type: string;

  @Column()
  result: string;

  @Column()
  creator: string;

  @Column({ name: 'tx_hash', nullable: true })
  tx_hash: string;
}
