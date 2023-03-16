import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsNumber } from 'class-validator';
import { RangeType } from '../utils/enum';

export class Cw20MetricParamsDto {
  @ApiPropertyOptional({
    enum: RangeType,
    description: 'Optional, defaults to minute',
    type: RangeType,
    example: RangeType.minute,
    default: RangeType.minute,
  })
  @IsEnum(RangeType)
  @ApiProperty()
  readonly rangeType: RangeType = RangeType.minute;

  @ApiProperty()
  @IsNotEmpty()
  coinId: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  @Transform(({ value }) => Number(value))
  min: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  @Transform(({ value }) => Number(value))
  max: number;
}
