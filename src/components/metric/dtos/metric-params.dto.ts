import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Range } from '../utils/enum';

export class MetricParamsDto {
  @ApiPropertyOptional({
    enum: Range,
    description: 'Optional, defaults to 24h',
    type: Range,
    example: Range.day,
    default: Range.hour,
  })
  @IsEnum(Range)
  @IsOptional()
  @ApiProperty()
  readonly range: Range = Range.hour;
}
