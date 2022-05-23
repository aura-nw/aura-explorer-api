import { Column, Entity } from "typeorm";
import { BaseEntityIncrementId } from "./base/base.entity";

@Entity('smart_contracts')
export class SmartContract extends BaseEntityIncrementId {
    @Column()
    height: number;

    @Column()
    contract_address: string;

    @Column()
    creator_address: string;

    @Column()
    contract_hash: string;

    @Column()
    schema: string;

    @Column()
    url: string;

    @Column()
    contract_verification: string;
}