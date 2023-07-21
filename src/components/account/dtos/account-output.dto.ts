import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { AccountBalance } from './account-balance.dto';
import { AccountDelegation } from './account-delegation.dto';
import { AccountRedelegation } from './account-redelegation.dto';
import { AccountUnbonding } from './account-unbonding.dto';
import { AccountVesting } from './account-vesting.dto';

export class AccountOutput {
  @Expose()
  @ApiProperty()
  acc_address: string;

  @Expose()
  @ApiProperty()
  available: string;

  @Expose()
  @ApiProperty()
  delegable_vesting: string;

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

  @Expose()
  @ApiProperty()
  vesting: AccountVesting;
}
