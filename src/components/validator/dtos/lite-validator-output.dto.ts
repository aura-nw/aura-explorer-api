import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class LiteValidatorOutput {
  @Expose()
  @ApiProperty()
  title: string;

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
  rank: number;

  @Expose()
  @ApiProperty()
  percent_power: string;

  @Expose()
  @ApiProperty()
  power: number;

  @Expose()
  @ApiProperty()
  cumulative_share_before: string;

  @Expose()
  @ApiProperty()
  cumulative_share: string;

  @Expose()
  @ApiProperty()
  cumulative_share_after: string;

  @Expose()
  @ApiProperty()
  commission: string;

  @Expose()
  @ApiProperty()
  jailed: string;
  
  @Expose()
  @ApiProperty()
  status_validator: boolean;

  @Expose()
  @ApiProperty()
  up_time: string;

  @Expose()
  @ApiProperty()
  target_count: number;

  @Expose()
  @ApiProperty()
  vote_count: number;

  @Expose()
  @ApiProperty()
  status: number;

  @Expose()
  @ApiProperty()
  identity: string;
}
