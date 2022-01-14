import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class StatusOutput {
  @Expose()
  @ApiProperty()
  block_height: number;

  @Expose()
  @ApiProperty()
  total_txs_num: number;

  @Expose()
  @ApiProperty()
  total_validator_num: number;
}
