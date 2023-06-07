import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, Min } from 'class-validator';

export class NftByContractParamsDto {
  @ApiProperty()
  @IsNotEmpty({ message: 'Contract address is required' })
  contract_address: string;

  @ApiProperty({ default: '' })
  keyword: string;

  @ApiProperty({ default: 4 })
  @Min(0)
  limit: number;

  @ApiProperty({ default: '' })
  next_key: string;
}
