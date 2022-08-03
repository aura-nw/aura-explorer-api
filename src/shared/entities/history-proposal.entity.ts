import { Column, CreateDateColumn, Entity, Unique } from "typeorm";
import { BaseEntityIncrementId } from "./base/base.entity";

@Entity('history_proposals')
export class HistoryProposal extends BaseEntityIncrementId {
    @Column()
    proposal_id: number;

    @Unique('tx_hash', ['tx_hash'])
    @Column()
    tx_hash: string;

    @Column()
    title: string;

    @Column({nullable: true, type: 'text'})
    description: string;

    @Column()
    recipient: string;

    @Column()
    amount: number;

    @Column()
    initial_deposit: number;

    @Column()
    proposer: string;
}

