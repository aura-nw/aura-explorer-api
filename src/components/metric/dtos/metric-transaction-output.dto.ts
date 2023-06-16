import { Expose } from 'class-transformer';

export class MetricTransactionOutput {
  @Expose()
  total: string;

  @Expose()
  timestamp: string;
}
