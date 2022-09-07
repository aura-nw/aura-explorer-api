import { Column, Entity } from "typeorm";
import { BaseEntityIncrementId } from "./base/base.entity";

@Entity('smart_contracts')
export class SmartContract extends BaseEntityIncrementId {
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
    mainnet_code_id: string;

    @Column()
    mainnet_upload_status: string;

    @Column()
    token_name: string;

    @Column()
    token_symbol: string;

    @Column()
    num_tokens: number;

    @Column()
    is_minted: boolean;
}