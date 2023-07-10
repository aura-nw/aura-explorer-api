import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { NAME_TAG_TYPE } from '../../../shared';
import { IsOptional, IsUrl } from 'class-validator';

export class StoreNameTagParamsDto {
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
