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

  @Column({ name: 'contract_verification', nullable: true })
  contract_verification: string;

  @Column({ name: 'compiler_version', nullable: true })
  compiler_version: string;

  @Column({ name: 'url', nullable: true })
  url: string;

  @Column({
    type: 'timestamp',
    nullable: true,
  })
  verified_at: Date;
}
