import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { NAME_TAG_TYPE, VIEW_TYPE } from '../../../shared';
import { Expose, classToPlain, plainToClass } from 'class-transformer';
import { NameTag } from '../../../shared/entities/name-tag.entity';
import { IsOptional, IsUrl } from 'class-validator';

export class StoreNameTagParamsDto {
  @Expose()
  id: number;

  @Expose()
  @ApiProperty({ default: '' })
  type: NAME_TAG_TYPE;

  @Expose()
  @ApiProperty({ default: '' })
  address: string;

  @ApiProperty({ default: '' })
  view_type: VIEW_TYPE;

  @Expose()
  @ApiProperty({ default: '' })
  name_tag: string;

  @Expose()
  @ApiPropertyOptional({ default: '' })
  note: string;

  static toModel(companyDto: StoreNameTagParamsDto): NameTag {
    const data = classToPlain(companyDto);
    return plainToClass(NameTag, data);
  }

  static toDto(entity: NameTag): StoreNameTagParamsDto {
    return plainToClass(StoreNameTagParamsDto, entity, {
      excludeExtraneousValues: true,
    });
  }
  userId: number;

  @Expose()
  @IsOptional()
  @ApiPropertyOptional({
    default: null,
  })
  enterpriseUrl: string;
}
