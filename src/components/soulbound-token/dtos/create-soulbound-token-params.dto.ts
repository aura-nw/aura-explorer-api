import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CreateSoulboundTokenParamsDto {
  @ApiProperty()
  @IsNotEmpty()
  attestor_address: string;

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
