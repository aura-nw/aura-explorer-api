import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class AccountOutput {
  @Expose()
  @ApiProperty()
  acc_address: string;

  @Expose()
  @ApiProperty()
  available: string;

  @Expose()
  @ApiProperty()
  delegatable_vesting: string;

  @Expose()
  @ApiProperty()
  delegated: string;

  @Expose()
  @ApiProperty()
  unbonding: string;

  @Expose()
  @ApiProperty()
  stake_reward: string;

  @Expose()
  @ApiProperty()
  commission: string;

  @Expose()
  @ApiProperty()
  total: string;

  @Expose()
  @ApiProperty()
  balances: AccountBalance[];

  @Expose()
  @ApiProperty()
  delegations: AccountDelegation[];

  @Expose()
  @ApiProperty()
  unbonding_delegations: AccountUnbonding[];

  @Expose()
  @ApiProperty()
  redelegations: AccountRedelegation[];
}

export class AccountBalance {
  @Expose()
  @ApiProperty()
  name: string;

  @Expose()
  @ApiProperty()
  denom: string;

  @Expose()
  @ApiProperty()
  amount: string;

  @Expose()
  @ApiProperty()
  price: string;

  @Expose()
  @ApiProperty()
  total: number;
}

export class AccountDelegation {
  @Expose()
  @ApiProperty()
  validator_name: string;

  @Expose()
  @ApiProperty()
  validator_address: string;

  @Expose()
  @ApiProperty()
  amount: string;

  @Expose()
  @ApiProperty()
  reward: string;
}

export class AccountUnbonding {
  @Expose()
  @ApiProperty()
  validator_name: string;

  @Expose()
  @ApiProperty()
  validator_address: string;

  @Expose()
  @ApiProperty()
  amount: string;

  @Expose()
  @ApiProperty()
  completion_time: string;
}

export class AccountRedelegation {
  @Expose()
  @ApiProperty()
  validator_src_name: string;

  @Expose()
  @ApiProperty()
  validator_src_address: string;

  @Expose()
  @ApiProperty()
  validator_dst_name: string;

  @Expose()
  @ApiProperty()
  validator_dst_address: string;

  @Expose()
  @ApiProperty()
  amount: string;

  @Expose()
  @ApiProperty()
  completion_time: string;
}