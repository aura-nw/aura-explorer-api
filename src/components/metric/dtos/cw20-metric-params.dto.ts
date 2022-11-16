import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { CW20MetricType } from '../utils/enum';
import { Range } from '../utils/enum';

export class Cw20MetricParamsDto{

  @ApiPropertyOptional({
    enum: Range,
    description: 'Optional, defaults to 24h',
    type: Range,
    example: Range.day,
    default: Range.hour,
  })
  @IsEnum(Range)
  @ApiProperty()
  readonly range: Range = Range.hour;

  @ApiProperty()
  @IsNotEmpty()
  coidId: string;

  @ApiPropertyOptional({
    enum: CW20MetricType,
    description: 'Optional, defaults to price',
    type: CW20MetricType,
    example: CW20MetricType.price,
    default: CW20MetricType.price,
  })
  @IsEnum(CW20MetricType)
  @ApiProperty()
  readonly type: CW20MetricType = CW20MetricType.price;
}
