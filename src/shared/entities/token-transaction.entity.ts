import { Column, Entity, Unique } from "typeorm";
import { BaseEntityIncrementId } from "./base/base.entity";

@Entity('token_transactions')
@Unique(['contract_address'])
export class TokenTransaction extends BaseEntityIncrementId {
    @Column()
    tx_hash: string;

    @Column()
    contract_address: string;

    @Column()
    token_id: string;

    @Column()
    transaction_type: string;

    @Column()
    from_address: string;

    @Column()
    to_address: string;

    @Column()
    sender: string;

    @Column()
    amount: number;

    @Column()
    height: number;
}