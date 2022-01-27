import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class MetricStatusOutput {
  @Expose()
  @ApiProperty()
  block_height: string;

  @Expose()
  @ApiProperty()
  total_txs_num: string;

  @Expose()
  @ApiProperty()
  total_validator_num: string;
}
