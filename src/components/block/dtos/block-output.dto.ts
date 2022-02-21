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
  proposer: string;

  @Expose()
  @ApiProperty()
  num_txs: number;

  @Expose()
  @ApiProperty()
  timestamp: Date;
}

export class BlockOutput {
  @Expose()
  @ApiProperty()
  block_hash: string;

  @Expose()
  @ApiProperty()
  chainid: string;

  @Expose()
  @ApiProperty()
  height: number;

  @Expose()
  @ApiProperty()
  id: number;

  @Expose()
  @ApiProperty()
  identity: string;

  @Expose()
  @ApiProperty()
  moniker: string;

  @Expose()
  @ApiProperty()
  num_signatures: number;

  @Expose()
  @ApiProperty()
  num_txs: number;

  @Expose()
  @ApiProperty()
  operator_address: string;

  @Expose()
  @ApiProperty()
  proposer: string;

  @Expose()
  @ApiProperty()
  timestamp: Date;

  @Expose()
  @ApiProperty()
  txs: [];
}
