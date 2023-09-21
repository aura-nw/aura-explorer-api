import { ApiProperty } from '@nestjs/swagger';

class CW20TokenResponseAttributes {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({
    example: 'aura122y3pjz5vh44eqk3rz88vfsn8u4526eyguzdewd36f4z7h9wxqjsnkwzrd',
  })
  contract_address: string;

  @ApiProperty({ example: 'usd-coin' })
  coin_id: string;

  @ApiProperty({
    example:
      'https://aura-explorer-assets.s3.ap-southeast-1.amazonaws.com/dev-assets/token/download.png',
  })
  image: string;

  @ApiProperty({ example: 'VERIFIED' })
  verify_status: string;

  @ApiProperty({ example: 'Verified by Aura Network' })
  verify_text: string;
}

class ListCW20Token {
  @ApiProperty({ isArray: true, type: CW20TokenResponseAttributes })
  cw20Tokens: CW20TokenResponseAttributes[];

  @ApiProperty()
  count: number;
}

class CW20Token {
  @ApiProperty({ type: CW20TokenResponseAttributes })
  cw20Token: CW20TokenResponseAttributes;
}

export class GetCW20TokenResult {
  @ApiProperty()
  data: ListCW20Token;
}

export class GetCW20TokenDetail {
  @ApiProperty()
  data: CW20Token;
}
