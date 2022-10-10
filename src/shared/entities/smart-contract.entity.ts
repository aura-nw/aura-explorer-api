import { Column, Entity } from "typeorm";
import { BaseEntityIncrementId } from "./base/base.entity";

@Entity('smart_contracts')
export class SmartContract extends BaseEntityIncrementId {
    @Column({
        type: 'timestamp'
    })
    verified_at: Date;

    @Column()
    height: number;

    @Column()
    code_id: number;

    @Column()
    contract_name: string;

    @Column()
    contract_address: string;

    @Column()
    creator_address: string;

    @Column()
    contract_hash: string;

    @Column()
    tx_hash: string;

    @Column()
    url: string;

    @Column({ type: 'text' })
    instantiate_msg_schema: string;

    @Column({ type: 'text' })
    query_msg_schema: string;

    @Column({ type: 'text' })
    execute_msg_schema: string;

    @Column()
    contract_match: string;

    @Column()
    contract_verification: string;

    @Column()
    compiler_version: string;

    @Column()
    s3_location: string;

    @Column()
    reference_code_id: number;

    @Column()
    mainnet_upload_status: string;

    @Column()
    token_name: string;

    @Column()
    token_symbol: string;

    @Column()
    num_tokens: number;

    @Column({
        nullable: true
    })
    project_name: string;

    @Column({ 
        type: 'text',
        nullable: true
    })
    official_project_website: string;

    @Column({
        nullable: true
    })
    official_project_email: string;

    @Column({
        nullable: true
    })
    whitepaper: string;

    @Column({
        nullable: true
    })
    github: string;

    @Column({
        nullable: true
    })
    telegram: string;

    @Column({
        nullable: true
    })
    wechat: string;

    @Column({
        nullable: true
    })
    linkedin: string;

    @Column({
        nullable: true
    })
    discord: string;

    @Column({
        nullable: true
    })
    medium: string;

    @Column({
        nullable: true
    })
    reddit: string;

    @Column({
        nullable: true
    })
    slack: string;

    @Column({
        nullable: true
    })
    facebook: string;

    @Column({
        nullable: true
    })
    twitter: string;

    @Column({
        nullable: true
    })
    bitcointalk: string;
}