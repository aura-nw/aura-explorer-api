import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { NAME_TAG_TYPE } from '../../../shared';
import { IsOptional } from 'class-validator';

export class StorePublicNameTagParamsDto {
  @ApiProperty({ default: '' })
  id: number;

  @ApiProperty({ default: '' })
  type: NAME_TAG_TYPE;

  @ApiProperty({ default: '' })
  address: string;

  @ApiProperty({ default: '' })
  nameTag: string;

  @ApiProperty({ default: '' })
  userId: number;

  @IsOptional()
  @ApiPropertyOptional({
    default: null,
  })
  enterpriseUrl: string;
}
