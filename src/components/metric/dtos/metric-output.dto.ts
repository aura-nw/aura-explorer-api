import { Expose } from 'class-transformer';

export class MetricOutput {
  @Expose()
  total: string;

  @Expose()
  timestamp: string;
}
