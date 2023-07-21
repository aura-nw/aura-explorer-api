import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

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
  price: number;

  @Expose()
  @ApiProperty()
  total_price: number;
}
