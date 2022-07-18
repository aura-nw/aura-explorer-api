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

  @Expose()
  @ApiProperty()
  total_validator_active_num: number;

  @Expose()
  @ApiProperty()
  block_time: string;

  @Expose()
  @ApiProperty()
  bonded_tokens: number;

  @Expose()
  @ApiProperty()
  inflation: string;

  @Expose()
  @ApiProperty()
  community_pool: number;

  @Expose()
  @ApiProperty()
  supply: number;
}
