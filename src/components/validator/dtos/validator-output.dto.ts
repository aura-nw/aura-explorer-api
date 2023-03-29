import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class ValidatorOutput {
  @Expose()
  rank: number;

  @Expose()
  title: string;

  @Expose()
  website: string;

  @Expose()
  operator_address: string;

  @Expose()
  acc_address: string;

  @Expose()
  cons_address: string;

  @Expose()
  percent_power: string;

  @Expose()
  power: string;

  @Expose()
  percent_self_bonded: string;

  @Expose()
  self_bonded: number;

  @Expose()
  commission: string;

  @Expose()
  jailed: string;

  @Expose()
  bonded_height: number;

  @Expose()
  details: string;

  @Expose()
  up_time: string;

  @Expose()
  status: number;

  @Expose()
  identity: string;

  @Expose()
  image_url: string;
}
