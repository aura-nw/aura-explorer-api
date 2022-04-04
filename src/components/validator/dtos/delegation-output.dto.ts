import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

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
