import { ApiProperty } from '@nestjs/swagger';
import { NameTag } from '../../../shared/entities/name-tag.entity';

export class GethNameTagResult {
  @ApiProperty()
  data: { nameTags: NameTag[] };

  @ApiProperty()
  nextKey: number;
}
