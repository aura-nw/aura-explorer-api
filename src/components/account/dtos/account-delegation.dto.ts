import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

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

  @Expose()
  @ApiProperty()
  validator_identity: string;

  @Expose()
  @ApiProperty()
  image_url: string;

  @Expose()
  @ApiProperty()
  jailed: number;
}
