import { ApiProperty } from '@nestjs/swagger';

class PrivateNameTagResponseAttributes {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({
    example: 'aura1dylphmzd0gkdpuvyy3h7u5ffr8x0y2eajj0q5w2q8txnw33g0k0ss34cjy',
  })
  address: string;

  @ApiProperty({ example: false })
  isFavorite: boolean;

  @ApiProperty({ example: 'private-name-tag' })
  nameTag: string;

  @ApiProperty({ example: 'note' })
  note: string;

  @ApiProperty({ example: '2023-07-31T02:55:47.994Z' })
  createdAt: Date;

  @ApiProperty({ example: '2023-07-31T02:55:47.994Z' })
  updatedAt: Date;
}

class ListPrivateNameTag {
  @ApiProperty({ isArray: true, type: PrivateNameTagResponseAttributes })
  nameTags: PrivateNameTagResponseAttributes[];

  @ApiProperty()
  count: number;

  @ApiProperty()
  nextKey: number;
}

export class GetPrivateNameTagResult {
  @ApiProperty()
  data: ListPrivateNameTag;
}
