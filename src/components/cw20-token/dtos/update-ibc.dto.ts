import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';
import { CreateIbcDto } from './create-ibc.dto';
import { Expose } from 'class-transformer';

export class UpdateIbcDto extends PartialType(CreateIbcDto) {
  @Expose()
  @ApiProperty()
  id: number;

  @Expose()
  @ApiProperty()
  @IsString()
  @IsOptional()
  denom: string;

  @Expose()
  @ApiProperty()
  @IsNumber()
  @IsOptional()
  decimal: number;
}
