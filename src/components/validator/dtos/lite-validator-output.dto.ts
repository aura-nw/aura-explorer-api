import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class LiteValidatorOutput {
  @Expose()
  title: string;

  @Expose()
  operator_address: string;

  @Expose()
  acc_address: string;

  @Expose()
  cons_address: string;

  @Expose()
  rank: number;

  @Expose()
  percent_power: string;

  @Expose()
  power: number;

  @Expose()
  cumulative_share_before: string;

  @Expose()
  cumulative_share: string;

  @Expose()
  cumulative_share_after: string;

  @Expose()
  commission: string;

  @Expose()
  jailed: string;

  @Expose()
  status_validator: boolean;

  @Expose()
  up_time: string;

  @Expose()
  target_count: number;

  @Expose()
  vote_count: number;

  @Expose()
  status: number;

  @Expose()
  identity: string;

  @Expose()
  image_url: string;
}
