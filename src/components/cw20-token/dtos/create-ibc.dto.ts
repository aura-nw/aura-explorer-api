import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import {
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';
import { IsUniqueManyColumn } from '../validators/is-unique-many-column.validator';

@Expose()
export class CreateIbcDto {
  @IsUniqueManyColumn(['chain_id', 'denom'], {
    message: 'chain_id and denom must be unique.',
  })
  @ApiProperty()
  chain_id: string;

  @ApiProperty()
  @IsString()
  denom: string;

  @ApiProperty()
  coin_id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  symbol: string;

  @ApiProperty()
  image: string;

  @ApiProperty()
  @IsNumber()
  decimal: number;

  @ApiProperty()
  verify_status: string;

  @ApiProperty()
  verify_text: string;

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
  social_profiles: any;
}
