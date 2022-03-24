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
}

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
}

export class DelegationOutput {
  @Expose()
  @ApiProperty()
  delegator_address: string;

  @Expose()
  @ApiProperty()
  validator_address: string;

  @Expose()
  @ApiProperty()
  shares: string;

  @Expose()
  @ApiProperty()
  amount: number;
}
