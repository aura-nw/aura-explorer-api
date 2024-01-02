import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsValidBench32Address } from '../../watch-list/validators/validate-address';
import { IsUnique } from '../validators/is-unique.validator';
import { IsObject, IsOptional, IsUrl } from 'class-validator';

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
  description: string;

  @ApiProperty()
  decimal: number;

  @ApiProperty()
  chain_id: string;

  @ApiPropertyOptional()
  @IsUrl()
  @IsOptional()
  official_site: string;

  @ApiPropertyOptional({
    example: {
      github: 'https://github.com/...',
      twitter: 'https://twitter.com/...',
      facebook: 'https://facebook.com/...',
      email: 'example@aura.network',
    },
  })
  @IsOptional()
  @IsObject()
  social_profiles: JSON;
}
