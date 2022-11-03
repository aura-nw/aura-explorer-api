import { Column, Entity, PrimaryColumn } from 'typeorm';
import { BaseEntity } from './base/base.entity';

@Entity('sync_transactions')
export class SyncTransaction extends BaseEntity {
  @PrimaryColumn({ type: 'string', name: 'tx_hash' })
  tx_hash: string;

  @Column({ type: 'string', name: 'type' })
  type: string;

  @Column({ type: 'string', name: 'contract_address' })
  contract_address: string;

  @Column({ type: 'string', name: 'from_address' })
  from_address: string;

  @Column({ type: 'string', name: 'to_address' })
  to_address: string;

  @Column({ type: 'decimal', name: 'amount' })
  amount: string;

  @Column({ type: 'decimal', name: 'fee' })
  fee: number;

  @Column({ type: 'datetime', name: 'timestamp' })
  timestamp: Date;
}
