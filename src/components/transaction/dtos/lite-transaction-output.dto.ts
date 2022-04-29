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
  code: number;

  @Expose()
  @ApiProperty()
  fee: string;

  @Expose()
  @ApiProperty()
  blockId: number;

  @Expose()
  @ApiProperty()
  messages: string;

  @Expose()
  @ApiProperty()
  raw_log: string;

  @Expose()
  @ApiProperty()
  amount?: string;
}
