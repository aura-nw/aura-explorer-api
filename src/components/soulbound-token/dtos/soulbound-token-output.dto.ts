import { Expose } from 'class-transformer';

export class SoulboundTokenOutputDto {
  @Expose()
  id: number;

  @Expose()
  contract_address: number;

  @Expose()
  token_name: string;

  @Expose()
  minter_address: string;

  @Expose()
  token_symbol: string;
}
