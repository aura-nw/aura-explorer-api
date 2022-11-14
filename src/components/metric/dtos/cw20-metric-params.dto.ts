import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { CW20MetricType } from '../utils/enum';
import { MetricParamsDto } from './metric-params.dto';

export class Cw20MetricParamsDto extends MetricParamsDto {
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
