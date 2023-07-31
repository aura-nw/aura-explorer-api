import { ApiProperty } from '@nestjs/swagger';

class PublicNameTagResponseAttributes {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({
    example: 'aura1dylphmzd0gkdpuvyy3h7u5ffr8x0y2eajj0q5w2q8txnw33g0k0ss34cjy',
  })
  address: string;

  @ApiProperty({ example: 'public-name' })
  name_tag: string;

  @ApiProperty({ example: 'https://example.com/' })
  enterpriseUrl: string;
}

class ListPublicNameTag {
  @ApiProperty({ isArray: true, type: PublicNameTagResponseAttributes })
  nameTags: PublicNameTagResponseAttributes[];

  @ApiProperty()
  count: number;

  @ApiProperty()
  nextKey: number;
}

export class GetPublicNameTagResult {
  @ApiProperty()
  data: ListPublicNameTag;
}
