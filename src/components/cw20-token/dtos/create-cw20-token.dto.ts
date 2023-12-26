import { ApiProperty } from '@nestjs/swagger';
import { IsValidBench32Address } from '../../watch-list/validators/validate-address';
import { IsUnique } from '../validators/is-unique.validator';

export class CreateCw20TokenDto {
  @ApiProperty()
  @IsValidBench32Address('contract_address')
  @IsUnique('contract_address')
  contract_address: string;

  @ApiProperty()
  coin_id: string;

  @ApiProperty()
  symbol: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  image: string;

  @ApiProperty()
  verify_status: string;

  @ApiProperty()
  verify_text: string;

  @ApiProperty()
  denom: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  decimal: number;

  @ApiProperty()
  chain_id: string;
}
