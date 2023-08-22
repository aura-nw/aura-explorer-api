import { ApiProperty } from '@nestjs/swagger';

class PublicNameTagAttributes {
  @ApiProperty({ example: 1 })
  id;

  @ApiProperty({
    example: 'aura1dylphmzd0gkdpuvyy3h7u5ffr8x0y2eajj0q5w2q8txnw33g0k0ss34201',
  })
  address;

  @ApiProperty({ example: 'address' })
  type;

  @ApiProperty({ example: 'name' })
  name_tag;

  @ApiProperty({ example: '2023-07-31T02:55:47.994Z' })
  created_at;

  @ApiProperty({ example: 'Abc1234@gmail12.com' })
  email;

  @ApiProperty({ example: 'https://example.com/' })
  enterpriseUrl;
}

export class GetPublicNameTagAdminResult {
  @ApiProperty({ type: PublicNameTagAttributes, isArray: true })
  data: PublicNameTagAttributes[];
}
