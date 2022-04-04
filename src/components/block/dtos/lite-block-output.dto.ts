import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class LiteBlockOutput {
  @Expose()
  @ApiProperty()
  height: number;

  @Expose()
  @ApiProperty()
  block_hash: string;

  @Expose()
  @ApiProperty()
  num_txs: number;

  @Expose()
  @ApiProperty()
  proposer: string;

  @Expose()
  @ApiProperty()
  operator_address: string;

  @Expose()
  @ApiProperty()
  timestamp: Date;

  @Expose()
  @ApiProperty()
  id: number;

  @Expose()
  @ApiProperty()
  isSync: boolean;
}