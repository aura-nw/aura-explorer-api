import { ApiProperty } from '@nestjs/swagger';

class IbcTokenResponseAttributes {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({
    example:
      'ibc/40CA5EF447F368B7F2276A689383BE3C427B15395D4BF6639B605D36C0846A20',
  })
  denom: string;

  @ApiProperty({ example: 'usd-coin' })
  coin_id: string;

  @ApiProperty({ example: 'TAURA' })
  symbol: string;

  @ApiProperty({ example: 'Test Aura' })
  name: string;

  @ApiProperty({
    example:
      'https://aura-explorer-assets.s3.ap-southeast-1.amazonaws.com/dev-assets/token/download.png',
  })
  image: string;

  @ApiProperty({ example: 'VERIFIED' })
  verify_status: string;

  @ApiProperty({ example: 'Verified by Aura Network' })
  verify_text: string;

  @ApiProperty({ example: 6 })
  decimal: number;
}

class ListIbcToken {
  @ApiProperty({ isArray: true, type: IbcTokenResponseAttributes })
  ibcTokens: IbcTokenResponseAttributes[];

  @ApiProperty()
  count: number;
}
class IbcToken {
  @ApiProperty({ type: IbcTokenResponseAttributes })
  ibcToken: IbcTokenResponseAttributes;
}

export class GetIbcTokenResult {
  @ApiProperty()
  data: ListIbcToken;
}
export class GetIbcTokenDetail {
  @ApiProperty()
  data: IbcToken;
}
