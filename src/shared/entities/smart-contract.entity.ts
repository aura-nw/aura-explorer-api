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

    @Column()
    contract_match: string;

    @Column()
    contract_verification: string;

    @Column()
    compiler_version: string;
}