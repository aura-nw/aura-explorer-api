import { Expose } from 'class-transformer';

export class TokenPickedByAddressOutput {
  @Expose()
  id: number;

  @Expose()
  contract_address: number;

  @Expose()
  token_id: string;

  @Expose()
  token_uri: string;

  @Expose()
  token_img: string;

  @Expose()
  receiver_address: string;

  @Expose()
  signature: string;

  @Expose()
  picked: boolean;

  @Expose()
  pub_key: string;
}
