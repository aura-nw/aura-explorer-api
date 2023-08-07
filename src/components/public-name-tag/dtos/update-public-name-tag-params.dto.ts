import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { NAME_TAG_TYPE } from '../../../shared';
import { IsOptional, MaxLength } from 'class-validator';

export class UpdatePublicNameTagParamsDto {
  @ApiProperty({ default: '' })
  id: number;

  @ApiProperty({ default: '' })
  @MaxLength(35)
  nameTag: string;

  @IsOptional()
  @ApiPropertyOptional({
    default: null,
  })
  enterpriseUrl: string;
}
