import { Column, Entity } from "typeorm";
import { BaseEntityIncrementId } from "./base/base.entity";

@Entity('history-proposal')
export class HistoryProposal extends BaseEntityIncrementId {
    @Column()
    tx_hash: string;

    @Column()
    title: string;

    @Column()
    description: string;

    @Column()
    recipient: string;

    @Column()
    amount: string;

    @Column()
    initial_deposit: number;

    @Column()
    proposer: number;
}

