import { ApiProperty } from '@nestjs/swagger';
import { NameTag } from 'src/shared/entities/name-tag.entity';

export class SearchNameTagResult {
  @ApiProperty()
  data: { nameTags: NameTag[] };

  @ApiProperty()
  nextKey: number;
}
