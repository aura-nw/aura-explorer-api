import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class ContractByCreatorOutputDto {
  @Expose()
  @ApiProperty()
  height: number;

  @Expose()
  @ApiProperty()
  code_id: number;

  @Expose()
  @ApiProperty()
  contract_name: string;

  @Expose()
  @ApiProperty()
  contract_address: string;

  @Expose()
  @ApiProperty()
  creator_address: string;

  @Expose()
  @ApiProperty()
  contract_hash: string;

  @Expose()
  @ApiProperty()
  tx_hash: string;

  @Expose()
  @ApiProperty()
  url: string;

  @Expose()
  @ApiProperty()
  instantiate_msg_schema: string;

  @Expose()
  @ApiProperty()
  query_msg_schema: string;

  @Expose()
  @ApiProperty()
  execute_msg_schema: string;

  @Expose()
  @ApiProperty()
  contract_match: string;

  @Expose()
  @ApiProperty()
  contract_verification: string;

  @Expose()
  @ApiProperty()
  compiler_version: string;

  @Expose()
  @ApiProperty()
  s3_location: string;

  @Expose()
  @ApiProperty()
  reference_code_id: number;

  @Expose()
  @ApiProperty()
  mainnet_upload_status: string;

  @Expose()
  @ApiProperty()
  status: string;

  @Expose()
  @ApiProperty()
  type: string;

  @Expose()
  @ApiProperty()
  verified_at: Date;

  @Expose()
  @ApiProperty()
  result: string;

  @Expose()
  @ApiProperty()
  project_name: string;
}
