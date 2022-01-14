import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNumber, IsOptional } from 'class-validator';

export class FabricPaginationParamsDto {
  @ApiPropertyOptional({
    description: 'Optional, defaults to 5',
    type: Number,
  })
  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10), { toClassOnly: true })
  limit = 5;

  @ApiPropertyOptional({ description: 'Optional, defaults to 0', type: Number })
  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10), { toClassOnly: true })
  offset = 0;
}
