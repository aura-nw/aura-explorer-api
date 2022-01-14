import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNumber, IsOptional } from 'class-validator';

export class TxParamsDto {
  @ApiPropertyOptional({
    description: 'Optional, defaults to 20',
    type: Number,
  })
  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10), { toClassOnly: true })
  limit = 20;

  @ApiPropertyOptional({ description: 'Optional, defaults to 0', type: Number })
  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10), { toClassOnly: true })
  offset = 0;
}
