import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class TokenUpdatedParasDto {
  @ApiProperty()
  tokenId: number;

  @ApiProperty()
  @IsNotEmpty()
  contractAddress: string;

  @ApiProperty()
  receiverAddress: string;

  @ApiProperty()
  minterAddress: string;
}
