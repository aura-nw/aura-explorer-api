import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class LiteTransactionOutput {
  @Expose()
  @ApiProperty()
  tx_hash: string;

  @Expose()
  @ApiProperty()
  height: number;

  @Expose()
  @ApiProperty()
  type: string;

  @Expose()
  @ApiProperty()
  timestamp: Date;

  @Expose()
  @ApiProperty()
  code: string;

  @Expose()
  @ApiProperty()
  fee: string;

  @Expose()
  @ApiProperty()
  blockId: number;
  
  @Expose()
  @ApiProperty()
  messages: any;
}

export class TransactionOutput {
  @Expose()
  @ApiProperty()
  tx_hash: string;

  @Expose()
  @ApiProperty()
  code: number;

  @Expose()
  @ApiProperty()
  codespace: string;

  @Expose()
  @ApiProperty()
  data: string;

  @Expose()
  @ApiProperty()
  gas_used: number;

  @Expose()
  @ApiProperty()
  gas_wanted: number;

  @Expose()
  @ApiProperty()
  info: string;

  @Expose()
  @ApiProperty()
  height: number;

  @Expose()
  @ApiProperty()
  num_txs: number;

  @Expose()
  @ApiProperty()
  type: string;

  @Expose()
  @ApiProperty()
  raw_log: string;

  @Expose()
  @ApiProperty()
  timestamp: Date;

  @Expose()
  @ApiProperty()
  tx: string;
}
