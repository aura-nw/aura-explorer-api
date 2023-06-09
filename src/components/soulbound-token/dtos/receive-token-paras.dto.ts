import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsOptional, Max, Min } from 'class-validator';
import { PAGE_REQUEST } from '../../../shared';

export class ReceiverTokenParasDto {
  @ApiProperty()
  @IsNotEmpty()
  receiverAddress: string;

  @ApiProperty({ default: false })
  isEquipToken: string;

  @ApiPropertyOptional({ default: '' })
  keyword: string;

  @ApiPropertyOptional({
    description: `Optional, defaults to ${PAGE_REQUEST.MAX}`,
    type: Number,
  })
  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 0), { toClassOnly: true })
  @Max(PAGE_REQUEST.MAX)
  @Min(0)
  limit: number = PAGE_REQUEST.MAX;

  @ApiProperty({ default: 0 })
  @IsNumber()
  @Transform(({ value }) => parseInt(value, 0), { toClassOnly: true })
  @Min(0)
  offset: number;
}
