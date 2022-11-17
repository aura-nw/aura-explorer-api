import { Column, Entity } from "typeorm";
import { SOULBOUND_TOKEN_STATUS } from "../constants";
import { BaseEntityIncrementId } from "./base/base.entity";

@Entity('soulbound_token')
export class SoulboundToken extends BaseEntityIncrementId {
    @Column()
    smart_contract_id: number;

    @Column()
    receiver_address: string;

    @Column({type: 'enum'})
    status: SOULBOUND_TOKEN_STATUS;
}