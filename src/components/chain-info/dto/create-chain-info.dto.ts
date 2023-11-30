import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { IsUnique } from '../validator/is-unique.validator';

export class CreateChainInfoDto {
  @ApiProperty()
  @IsString()
  @IsUnique(['chainId'], { message: 'Chain id must be unique.' })
  chainId: string;

  @ApiProperty()
  @IsString()
  chainName: string;

  @ApiProperty()
  @IsString()
  chainImage: string;
}
