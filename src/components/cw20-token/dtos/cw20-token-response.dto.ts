import { ApiProperty, PartialType } from '@nestjs/swagger';
import { UpdateCw20TokenDto } from './update-cw20-token.dto';

export class Cw20TokenResponseDto extends PartialType(UpdateCw20TokenDto) {
  @ApiProperty()
  max_supply: number;

  @ApiProperty()
  current_price: number;

  @ApiProperty()
  price_change_percentage_24h: number;

  @ApiProperty()
  total_volume: number;

  @ApiProperty()
  circulating_market_cap: number;

  @ApiProperty()
  circulating_supply: number;

  @ApiProperty()
  market_cap: number;

  @ApiProperty()
  fully_diluted_valuation: number;

  @ApiProperty()
  created_at: Date;

  @ApiProperty()
  updated_at: Date;

  @ApiProperty()
  id: number;
}
