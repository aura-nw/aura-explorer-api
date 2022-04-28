import { Column, CreateDateColumn, Entity, Unique } from "typeorm";
import { BaseEntityIncrementId } from "./base/base.entity";

@Entity('proposal_deposits')
export class ProposalDeposit extends BaseEntityIncrementId {
    @Column()
    proposal_id: number;

    @Unique('tx_hash', ['tx_hash'])
    @Column()
    tx_hash: string;

    @Column()
    depositor: string;

    @Column()
    amount: number;
}