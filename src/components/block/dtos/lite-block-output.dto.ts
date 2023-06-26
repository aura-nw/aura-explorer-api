import { Expose } from 'class-transformer';

export class LiteBlockOutput {
  @Expose()
  height: number;

  @Expose()
  block_hash: string;

  @Expose()
  num_txs: number;

  @Expose()
  proposer: string;

  @Expose()
  operator_address: string;

  @Expose()
  timestamp: Date;

  @Expose()
  id: number;

  @Expose()
  isSync: boolean;
}
