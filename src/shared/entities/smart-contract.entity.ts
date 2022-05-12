import { Column, Entity } from "typeorm";
import { BaseEntityIncrementId } from "./base/base.entity";

@Entity('smart_contracts')
export class SmartContract extends BaseEntityIncrementId {
    @Column()
    contract_address: string;

    @Column()
    creator_address: string;

    @Column()
    schema: string;

    @Column()
    url: string;
}