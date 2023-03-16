import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class ContractByCreatorOutputDto {
  @Expose()
  height: number;

  @Expose()
  code_id: number;

  @Expose()
  contract_name: string;

  @Expose()
  contract_address: string;

  @Expose()
  creator_address: string;

  @Expose()
  contract_hash: string;

  @Expose()
  tx_hash: string;

  @Expose()
  url: string;

  @Expose()
  instantiate_msg_schema: string;

  @Expose()
  query_msg_schema: string;

  @Expose()
  execute_msg_schema: string;

  @Expose()
  contract_match: string;

  @Expose()
  contract_verification: string;

  @Expose()
  compiler_version: string;

  @Expose()
  s3_location: string;

  @Expose()
  reference_code_id: number;

  @Expose()
  mainnet_upload_status: string;

  @Expose()
  status: string;

  @Expose()
  type: string;

  @Expose()
  verified_at: Date;

  @Expose()
  result: string;

  @Expose()
  project_name: string;

  @Expose()
  request_id: number;
}
