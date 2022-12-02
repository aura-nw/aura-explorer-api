import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class PickedNftParasDto {
  @ApiProperty()
  @IsNotEmpty()
  id: number;

  @ApiProperty()
  @IsNotEmpty()
  signature: string;

  @ApiProperty()
  @IsNotEmpty()
  msg: string;

  @ApiProperty()
  @IsNotEmpty()
  pubKey: string;

  @ApiProperty()
  @IsNotEmpty()
  picked: boolean;
}
