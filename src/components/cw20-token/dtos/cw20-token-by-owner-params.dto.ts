import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, Min } from 'class-validator';

export class Cw20TokenByOwnerParamsDto {
  @ApiProperty()
  @IsNotEmpty({ message: 'Account address is required' })
  account_address: string;

  @ApiProperty({ default: 10 })
  @Min(0)
  limit: number;

  @ApiProperty({ default: 0 })
  @Min(0)
  offset: number;

  @ApiProperty({ default: '' })
  keyword: string;
}
