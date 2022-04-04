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
  messages: string;
}
