import { ApiProperty } from '@nestjs/swagger';
import { PrivateNameTag } from '../../../shared/entities/private-name-tag.entity';

export class GetPrivateNameTagResult {
  @ApiProperty()
  data: { nameTags: PrivateNameTag[] };

  @ApiProperty()
  nextKey: number;
}
