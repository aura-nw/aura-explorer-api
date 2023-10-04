import { ApiProperty } from '@nestjs/swagger';
import {
  RANGE_EXPORT,
  TYPE_EXPORT,
} from '../../../shared/constants/transaction';
import { IsEnum, IsNotEmpty } from 'class-validator';

export class ExportCsvParamDto {
  @ApiProperty({
    enum: TYPE_EXPORT,
    type: TYPE_EXPORT,
    default: TYPE_EXPORT.ExecutedTxs,
  })
  @IsNotEmpty()
  @IsEnum(TYPE_EXPORT)
  dataType: TYPE_EXPORT;

  @ApiProperty({ default: '' })
  @IsNotEmpty()
  address: string;

  @ApiProperty({
    enum: RANGE_EXPORT,
    type: RANGE_EXPORT,
    default: RANGE_EXPORT.Date,
  })
  @IsNotEmpty()
  @IsEnum(RANGE_EXPORT)
  dataRangeType: RANGE_EXPORT;

  @ApiProperty({ default: '' })
  @IsNotEmpty()
  min: string;

  @ApiProperty({ default: '' })
  @IsNotEmpty()
  max: string;
}
