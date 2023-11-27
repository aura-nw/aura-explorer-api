import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsNumber, IsString } from 'class-validator';

@Expose()
export class CreateIbcDto {
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
