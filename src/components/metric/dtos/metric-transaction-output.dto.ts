import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class MetricTransactionOutput {
  @Expose()
  @ApiProperty()
  total: string;

  @Expose()
  @ApiProperty()
  timestamp: string;
}
