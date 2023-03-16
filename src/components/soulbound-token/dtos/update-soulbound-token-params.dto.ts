import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { SOULBOUND_TOKEN_STATUS } from '../../../shared';
import { VerifySignatureParasDto } from './verify-signature-paras.dto';

export class UpdateSoulboundTokenParamsDto extends VerifySignatureParasDto {
  @ApiProperty()
  @IsNotEmpty()
  id: number;

  @ApiProperty()
  @IsNotEmpty()
  contractAddress: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsEnum(SOULBOUND_TOKEN_STATUS)
  status: SOULBOUND_TOKEN_STATUS;
}
