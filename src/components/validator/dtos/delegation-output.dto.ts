//FIXME: delete this file because we don't use it anymore
import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class DelegationOutput {
  @Expose()
  @ApiProperty()
  delegator_address: string;

  @Expose()
  validator_address: string;

  @Expose()
  shares: string;

  @Expose()
  amount: number;
}
