import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsNumber, IsString } from 'class-validator';
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
}
