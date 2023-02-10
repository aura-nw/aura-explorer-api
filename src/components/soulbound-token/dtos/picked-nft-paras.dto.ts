import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { VerifySignatureParasDto } from './verify-signature-paras.dto';

export class PickedNftParasDto extends VerifySignatureParasDto {
  @ApiProperty()
  @IsNotEmpty()
  id: number;

  @ApiProperty()
  @IsNotEmpty()
  picked: boolean;
}
