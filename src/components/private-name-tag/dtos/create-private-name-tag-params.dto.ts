import { ApiProperty, OmitType } from '@nestjs/swagger';
import { StorePublicNameTagParamsDto } from '../../public-name-tag/dtos/store-public-name-tag-params.dto';
import { NAME_TAG_TYPE } from '../../../shared/constants/common';
import { IsEnum } from 'class-validator';

export class CreatePrivateNameTagParamsDto extends OmitType(
  StorePublicNameTagParamsDto,
  ['id', 'enterpriseUrl'] as const,
) {
  @ApiProperty({ default: '' })
  @IsEnum(NAME_TAG_TYPE)
  type: NAME_TAG_TYPE;

  @ApiProperty({ default: false })
  isFavorite: boolean;

  @ApiProperty({ default: null })
  note: string;
}
