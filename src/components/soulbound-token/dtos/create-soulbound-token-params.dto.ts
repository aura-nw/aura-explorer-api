import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { VerifySignatureParasDto } from './verify-signature-paras.dto';

export class CreateSoulboundTokenParamsDto extends VerifySignatureParasDto {
  @ApiProperty()
  @IsNotEmpty()
  contract_address: string;

  @ApiProperty()
  @IsNotEmpty()
  receiver_address: string;

  @ApiProperty()
  @IsNotEmpty()
  token_uri: string;
}
