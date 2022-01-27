import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class MetricOutput {
  @Expose()
  @ApiProperty()
  count: string;

  @Expose()
  @ApiProperty()
  timestamp: string;
}
