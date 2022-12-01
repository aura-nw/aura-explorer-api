import { Expose } from 'class-transformer';
import { SOULBOUND_TOKEN_STATUS } from '../../../shared';

export class TokenOutputDto {
  @Expose()
  id: number;

  @Expose()
  contract_address: number;

  @Expose()
  token_id: string;

  @Expose()
  token_uri: string;

  @Expose()
  receiver_address: string;

  @Expose()
  status: SOULBOUND_TOKEN_STATUS;

  @Expose()
  signature: string;
}
