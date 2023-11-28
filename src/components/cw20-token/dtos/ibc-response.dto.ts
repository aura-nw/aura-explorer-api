import { ApiProperty, PartialType } from '@nestjs/swagger';
import { UpdateIbcDto } from './update-ibc.dto';
import { Exclude, Expose } from 'class-transformer';
export class IbcResponseDto extends PartialType(UpdateIbcDto) {
  @Expose()
  @ApiProperty()
  id: number;

  @Expose()
  @ApiProperty()
  created_at: Date;

  @Expose()
  @ApiProperty()
  updated_at: Date;

  @Exclude()
  max_supply;

  @Exclude()
  current_price;

  @Exclude()
  price_change_percentage_24h;

  @Exclude()
  total_volume;

  @Exclude()
  circulating_supply;

  @Exclude()
  circulating_market_cap;

  @Exclude()
  market_cap;

  @Exclude()
  fully_diluted_valuation;

  @Exclude()
  contract_address;

  @Exclude()
  description;
}
