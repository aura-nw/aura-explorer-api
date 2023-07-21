import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, Min } from 'class-validator';
import { SOULBOUND_PICKED_TOKEN } from '../../../shared';

export class PickedTokenParasDto {
  @ApiProperty()
  @IsNotEmpty()
  receiverAddress: string;

  @ApiProperty({
    default: SOULBOUND_PICKED_TOKEN.MAX,
    type: Number,
  })
  @Transform(({ value }) => parseInt(value, 0), { toClassOnly: true })
  @Min(0)
  limit: number = SOULBOUND_PICKED_TOKEN.MAX;
}
