import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('proposal_votes')
export class ProposalVote {
    @PrimaryGeneratedColumn('increment')
    id: number;

    @Column()
    proposal_id: number;

    @Column()
    voter: string;

    @Column()
    tx_hash: string;

    @Column()
    option: string;

    @CreateDateColumn({
        type: 'timestamp',
        name: 'created_at',
    })
    created_at: Date;
    
}

