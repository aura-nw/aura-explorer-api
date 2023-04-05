import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class ValidatorInfoOutput {
  @Expose()
  @ApiProperty()
  rank: number;

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
  percent_self_bonded: string;

  @Expose()
  @ApiProperty()
  self_bonded: number;

  @Expose()
  @ApiProperty()
  commission: string;

  @Expose()
  @ApiProperty()
  jailed: string;

  @Expose()
  @ApiProperty()
  bonded_height: number;

  @Expose()
  @ApiProperty()
  details: string;

  @Expose()
  @ApiProperty()
  up_time: string;

  @Expose()
  @ApiProperty()
  status: number;

  @Expose()
  @ApiProperty()
  identity: string;

  @Expose()
  @ApiProperty()
  image_url: string;
}
