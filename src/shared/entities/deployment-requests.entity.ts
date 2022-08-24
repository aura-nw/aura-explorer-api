import { Column, Entity } from "typeorm";
import { BaseEntityIncrementId } from "./base/base.entity";

@Entity('deployment_requests')
export class DeploymentRequests extends BaseEntityIncrementId {
    @Column()
    request_id: number;

    @Column()
    name: string;

    @Column()
    email: string;

    @Column()
    contract_description: string;

    @Column()
    project_name: string;

    @Column()
    official_project_website: string;

    @Column()
    official_project_email: string;

    @Column()
    project_sector: string;

    @Column()
    whitepaper: string;

    @Column()
    github: string;

    @Column()
    telegram: string;

    @Column()
    discord: string;

    @Column()
    facebook: string;

    @Column()
    twitter: string;
    
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
    status: string;

    @Column()
    reason: string;
}