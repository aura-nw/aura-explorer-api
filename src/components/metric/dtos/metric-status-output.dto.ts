import { Expose } from 'class-transformer';

export class MetricStatusOutput {
  @Expose()
  block_height: string;

  @Expose()
  total_txs_num: string;

  @Expose()
  total_validator_num: string;
}
