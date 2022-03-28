import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";

export class ProposalOutput {
    @Expose()
    @ApiProperty()
    pro_id: number;

    @Expose()
    @ApiProperty()
    pro_title: string;

    @Expose()
    @ApiProperty()
    pro_status: string;

    @Expose()
    @ApiProperty()
    pro_proposer: string;

    @Expose()
    @ApiProperty()
    pro_voting_start_time: Date;

    @Expose()
    @ApiProperty()
    pro_voting_end_time: Date;

    @Expose()
    @ApiProperty()
    pro_votes_yes: number;

    @Expose()
    @ApiProperty()
    pro_votes_abstain: number;

    @Expose()
    @ApiProperty()
    pro_votes_no: number;

    @Expose()
    @ApiProperty()
    pro_votes_no_with_veto: number;

    @Expose()
    @ApiProperty()
    pro_submit_time: Date;

    @Expose()
    @ApiProperty()
    pro_total_deposits: number;
}