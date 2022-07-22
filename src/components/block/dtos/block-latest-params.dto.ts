import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNumber, IsOptional } from 'class-validator';

export class BlockLatestDto {
  @ApiPropertyOptional({
    description: 'Optional, defaults to 20',
    type: Number,
  })
  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 0), { toClassOnly: true })
  limit = 20;
}