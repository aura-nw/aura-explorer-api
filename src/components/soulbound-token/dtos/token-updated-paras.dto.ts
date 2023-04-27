import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class TokenUpdatedParasDto {
  @ApiProperty()
  tokenId: string;

  @ApiProperty()
  @IsNotEmpty()
  contractAddress: string;

  @ApiProperty()
  receiverAddress: string;

  @ApiProperty()
  rejectAll: boolean;
}
