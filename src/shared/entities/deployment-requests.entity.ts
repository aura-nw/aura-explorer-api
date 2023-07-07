import { Column, Entity } from 'typeorm';
import { BaseEntityIncrementId } from './base/base.entity';

@Entity('deployment_requests')
export class DeploymentRequests extends BaseEntityIncrementId {
  @Column()
  request_id: number;

  @Column()
  requester_address: string;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column({ type: 'text' })
  contract_description: string;

  @Column()
  project_name: string;

  @Column({ type: 'text' })
  official_project_website: string;

  @Column()
  official_project_email: string;

  @Column({
    nullable: true,
  })
  project_sector: string;

  @Column({
    nullable: true,
  })
  whitepaper: string;

  @Column({
    nullable: true,
  })
  github: string;

  @Column({
    nullable: true,
  })
  telegram: string;

  @Column({
    nullable: true,
  })
  wechat: string;

  @Column({
    nullable: true,
  })
  linkedin: string;

  @Column({
    nullable: true,
  })
  discord: string;

  @Column({
    nullable: true,
  })
  medium: string;

  @Column({
    nullable: true,
  })
  reddit: string;

  @Column({
    nullable: true,
  })
  slack: string;

  @Column({
    nullable: true,
  })
  facebook: string;

  @Column({
    nullable: true,
  })
  twitter: string;

  @Column({
    nullable: true,
  })
  bitcointalk: string;

  @Column()
  euphoria_code_id: number;

  @Column()
  mainnet_code_id: number;

  @Column()
  contract_hash: string;

  @Column()
  url: string;

  @Column({ type: 'text' })
  instantiate_msg_schema: string;

  @Column({ type: 'text' })
  query_msg_schema: string;

  @Column({ type: 'text' })
  execute_msg_schema: string;

  @Column()
  compiler_version: string;

  @Column()
  s3_location: string;

  @Column()
  status: string;

  @Column({
    nullable: true,
    type: 'text',
  })
  reason: string;
}
