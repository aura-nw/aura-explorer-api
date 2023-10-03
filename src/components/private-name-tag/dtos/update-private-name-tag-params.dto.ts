import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, MaxLength } from 'class-validator';
import { NAME_TAG_TYPE } from '../../../shared/constants/common';

export class UpdatePrivateNameTagParamsDto {
  @ApiPropertyOptional({ default: null })
  @MaxLength(35)
  @IsOptional()
  nameTag: string;

  @ApiPropertyOptional({ default: null })
  @IsEnum(NAME_TAG_TYPE)
  @IsOptional()
  type: NAME_TAG_TYPE;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  isFavorite: boolean;

  @ApiPropertyOptional({ default: null })
  @IsOptional()
  note: string;
}
