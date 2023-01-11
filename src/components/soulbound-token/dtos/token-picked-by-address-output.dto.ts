import { Expose } from 'class-transformer';
import { SOULBOUND_TOKEN_STATUS } from '../../../shared/constants/common';

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
  img_type: string;

  @Expose()
  animation_url: string;

  @Expose()
  receiver_address: string;

  @Expose()
  signature: string;

  @Expose()
  picked: boolean;

  @Expose()
  pub_key: string;

  @Expose()
  status: SOULBOUND_TOKEN_STATUS;
}
