import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { Range } from '../utils/enum';

export class Cw20MetricParamsDto {
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
  coinId: string;

  @ApiPropertyOptional({
    description: 'Optional, defaults undefined',
    default: undefined,
  })
  @ApiProperty()
  readonly maxDate: Date = undefined;
}
