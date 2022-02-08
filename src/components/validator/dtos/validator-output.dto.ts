import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class ValidatorOutput {
  @Expose()
  @ApiProperty()
  title: string;

  @Expose()
  @ApiProperty()
  website: string;

  @Expose()
  @ApiProperty()
  operator_address: string;

  @Expose()
  @ApiProperty()
  acc_address: string;

  @Expose()
  @ApiProperty()
  cons_address: string;

  @Expose()
  @ApiProperty()
  percent_power: string;

  @Expose()
  @ApiProperty()
  power: string;

  @Expose()
  @ApiProperty()
  self_stake: string;

  @Expose()
  @ApiProperty()
  fee: string;

  @Expose()
  @ApiProperty()
  blocks_proposed: number;

  @Expose()
  @ApiProperty()
  delegators: number;

  @Expose()
  @ApiProperty()
  power_24_change: string;

  @Expose()
  @ApiProperty()
  governance_votes: number;
}
