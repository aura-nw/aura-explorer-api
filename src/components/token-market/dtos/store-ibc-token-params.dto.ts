import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';
import { IsUnique } from '../validators/validate-unique';

export class StoreIbcTokenParamsDto {
  @ApiProperty({ default: 0 })
  @IsOptional()
  id: number;

  @ApiProperty({ default: '' })
  @IsNotEmpty()
  @IsUnique('denom', {
    message: 'The denom you entered has already been used.',
  })
  denom: string;

  @ApiProperty({ default: '' })
  @IsOptional()
  coin_id: string;

  @ApiProperty({ default: '' })
  @IsNotEmpty()
  name: string;

  @ApiProperty({ default: '' })
  @IsNotEmpty()
  symbol: string;

  @ApiProperty({ default: '' })
  @IsNotEmpty()
  image: string;

  @ApiProperty({ default: '' })
  @IsNotEmpty()
  decimal: number;

  @ApiPropertyOptional({ default: null })
  @IsOptional()
  verify_status: string;

  @ApiPropertyOptional({ default: null })
  @IsOptional()
  verify_text: string;
}
