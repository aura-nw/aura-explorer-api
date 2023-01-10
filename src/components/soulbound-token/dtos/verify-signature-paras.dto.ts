import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class VerifySignatureParasDto {
  @ApiProperty()
  @IsNotEmpty()
  signature: string;

  @ApiProperty()
  @IsNotEmpty()
  msg: string;

  @ApiProperty()
  @IsNotEmpty()
  pubKey: string;
}
