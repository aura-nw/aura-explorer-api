import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, Unique } from "typeorm";
import { BaseEntityIncrementId } from "./base/base.entity";

@Entity('proposal_votes')
export class ProposalVote extends BaseEntityIncrementId {
    @Column()
    proposal_id: number;

    @Column()
    voter: string;

    @Unique('tx_hash', ['tx_hash'])
    @Column()
    tx_hash: string;

    @Column()
    option: string;
}

