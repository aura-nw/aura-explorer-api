import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class AccountVesting {
  @Expose()
  @ApiProperty()
  type: string;

  @Expose()
  @ApiProperty()
  amount: string;

  @Expose()
  @ApiProperty()
  vesting_schedule: string;
}
