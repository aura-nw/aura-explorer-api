import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('proposals')
export class Proposal {
    @PrimaryGeneratedColumn('increment')
    pro_id: number;

    @Column({ nullable: false })
    pro_tx_hash: string;

    @Column({ nullable: false })
    pro_proposer: string;

    @Column({ nullable: false })
    pro_proposer_address: string;

    @Column({ nullable: false })
    pro_type: string;

    @Column({ nullable: false })
    pro_title: string;

    @Column({ nullable: true })
    pro_description: string;

    @Column({ nullable: true, default: null })
    pro_status: string;

    @Column({ nullable: false, default: 0.00000000 })
    pro_votes_yes: number;

    @Column({ nullable: false, default: 0.00000000 })
    pro_votes_abstain: number;

    @Column({ nullable: false, default: 0.00000000 })
    pro_votes_no: number;

    @Column({ nullable: false })
    pro_votes_no_with_veto: number;

    @Column({ nullable: false })
    pro_submit_time: Date;

    @Column({ nullable: false })
    pro_deposit_end_time: Date;

    @Column({ nullable: false, default: 0.00000000 })
    pro_total_deposits: number;

    @Column({ nullable: false, default: '2000-01-01 00:00:00' })
    pro_voting_start_time: Date;

    @Column({ nullable: false, default: '2000-01-01 00:00:00' })
    pro_voting_end_time: Date;

    @Column({ nullable: false, default: 0 })
    pro_voters: number;

    @Column({ nullable: false, default: 0.00 })
    pro_participation_rate: number;

    @Column({ nullable: false, default: 0.00000000 })
    pro_turnout: number;

    @Column({ nullable: false, type: 'json' })
    pro_activity: any;
}