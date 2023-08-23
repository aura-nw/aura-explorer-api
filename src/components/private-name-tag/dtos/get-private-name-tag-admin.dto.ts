import { ApiProperty } from '@nestjs/swagger';

class PrivateNameTagAttributes {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({
    example: 'aura1dylphmzd0gkdpuvyy3h7u5ffr8x0y2eajj0q5w2q8txnw33g0k0ss34201',
  })
  address: string;

  @ApiProperty({ example: false })
  isFavorite: boolean;

  @ApiProperty({ example: 'account' })
  type: string;

  @ApiProperty({ example: 'name' })
  nameTag: string;

  @ApiProperty({ example: 'note' })
  note: string;

  @ApiProperty({ example: '2023-07-31T02:55:47.994Z' })
  createdAt: Date;

  @ApiProperty({ example: '2023-07-31T02:55:47.994Z' })
  updatedAt: Date;
}

export class GetPrivateNameTagAdminResult {
  @ApiProperty({ type: PrivateNameTagAttributes, isArray: true })
  data: PrivateNameTagAttributes[];
}
