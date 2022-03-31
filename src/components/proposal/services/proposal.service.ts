import { HttpService } from "@nestjs/axios";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { plainToClass } from 'class-transformer';
import { lastValueFrom } from "rxjs";
import { AkcLogger, RequestContext } from "../../../shared";
import { ProposalOutput } from "../dtos/proposal-output.dto";
import { ProposalRepository } from "../repositories/proposal.repository";
import { Interval } from "@nestjs/schedule";
import { Proposal } from "../../../shared/entities/proposal.entity";
import { BlockRepository } from "../../../components/block/repositories/block.repository";

@Injectable()
export class ProposalService {
    constructor(
        private readonly logger: AkcLogger,
        private configService: ConfigService,
        private httpService: HttpService,
        private proposalRepository: ProposalRepository,
        private blockRepository: BlockRepository
    ) {
        this.logger.setContext(ProposalService.name);
    }

    async getProposals(
        ctx: RequestContext
    ): Promise<any> {
        this.logger.log(ctx, `${this.getProposals.name} was called!`);

        const [proposals, count] = await this.proposalRepository.findAndCount({
            order: {pro_id: 'DESC'}
        });

        const proposalsOuput = plainToClass(ProposalOutput, proposals, {
            excludeExtraneousValues: true,
        });

        return { proposals: proposalsOuput, count };
    }

    async getProposalVote(
        ctx: RequestContext,
        proposalId: string,
        voter: string
    ): Promise<any> {
        this.logger.log(ctx, `${this.getProposalVote.name} was called!`);
        const api = this.configService.get<string>('node.api');
        //get proposal vote
        const paramsProposalVote = `/cosmos/gov/v1beta1/proposals/${proposalId}/votes/${voter}`;
        const proposalVoteData = await this.getDataAPI(api, paramsProposalVote);
        let proposalVote = {};
        if (proposalVoteData) {
            proposalVote = proposalVoteData;
        }

        return { proposalVote: proposalVote };
    }

    async getProposalsById(
        ctx: RequestContext,
        proposalId: string
        ): Promise<any> {
        this.logger.log(ctx, `${this.getProposalsById.name} was called!`);
        const proposalsOuput = await this.proposalRepository.findOne({
            where: { pro_id: proposalId },
          });
          return proposalsOuput;
    }

    async getVotesListById(
        ctx: RequestContext,
        proposalId: string
        ): Promise<any> {
        this.logger.log(ctx, `${this.getVotesListById.name} was called!`);
        const api = this.configService.get<string>('node.api');
        const paramsProposalVotes = `/cosmos/gov/v1beta1/proposals/${proposalId}/votes`;
        const proposalVoteData = await this.getDataAPI(api, paramsProposalVotes);

        let proposalVotes = {};
        if (proposalVoteData) {
            proposalVotes = proposalVoteData;
        }
        return { proposalVotes: proposalVotes };
    }

    async getDepositListById(
        ctx: RequestContext,
        proposalId: string
        ): Promise<any> {
        this.logger.log(ctx, `${this.getVotesListById.name} was called!`);
        const api = this.configService.get<string>('node.api');
        const paramsProposalDeposit = `/cosmos/gov/v1beta1/proposals/${proposalId}/deposits`;
        const proposalDepositData = await this.getDataAPI(api, paramsProposalDeposit);

        let proposalDeposit = {};
        if (proposalDepositData) {
            proposalDeposit = proposalDepositData;
        }
        return { proposalDeposit: proposalDeposit };
    }

    @Interval(500)
    async handleInterval() {
        const api = this.configService.get<string>('node.api');
        try {
            //fetching proposals from node
            const params = `/cosmos/gov/v1beta1/proposals`;
            const data = await this.getDataAPI(api, params);
            if (data && data.proposals && data.proposals.length > 0) {
                for(let i = 0; i < data.proposals.length; i++) {
                    const item: any = data.proposals[i];
                    //create proposal
                    let proposal = new Proposal();
                    proposal.pro_id = item.proposal_id;
                    proposal.pro_title = item.content['title'];
                    proposal.pro_status = item.status;
                    proposal.pro_proposer = '';
                    if (item.content.plan) {
                        const height = item.content.plan['height'];
                        const block = await this.blockRepository.findOne({
                            where: { height: height },
                        });
                        if (block) {
                            proposal.pro_proposer = block.proposer;
                        }
                    }
                    proposal.pro_voting_start_time = item.voting_start_time;
                    proposal.pro_voting_end_time = item.voting_end_time;
                    proposal.pro_votes_yes = 0.00000000;
                    proposal.pro_votes_abstain = 0.00000000;
                    proposal.pro_votes_no = 0.00000000;
                    proposal.pro_votes_no_with_veto = 0.00000000;
                    if (item.final_tally_result) {
                        proposal.pro_votes_yes = item.final_tally_result.yes;
                        proposal.pro_votes_abstain = item.final_tally_result.abstain;
                        proposal.pro_votes_no = item.final_tally_result.no;
                        proposal.pro_votes_no_with_veto = item.final_tally_result.no_with_veto;
                    }
                    proposal.pro_submit_time = item.submit_time;
                    proposal.pro_total_deposits = 0.00000000;
                    if (item.total_deposit && item.total_deposit.length > 0) {
                        proposal.pro_total_deposits = item.total_deposit[0].amount
                    }
                    //set value for column not null
                    proposal.pro_tx_hash = '';
                    proposal.pro_proposer_address = '';
                    proposal.pro_type = item.content['@type'];
                    proposal.pro_deposit_end_time = item.deposit_end_time;
                    proposal.pro_activity = '{"key": "activity", "value": ""}'; //tmp value
                    // insert into table proposals
                    try {
                        await this.proposalRepository.save(proposal);
                    } catch (error) {
                        this.logger.error(null, `Proposal is already existed!`);
                    }
                }
            }

        } catch(error) {
            this.logger.error(error, `Sync proposals error`);
        }
    }

    async getDataAPI(api, params) {
        const data = await lastValueFrom(this.httpService.get(api + params)).then(
          (rs) => rs.data,
        );
    
        return data;
    }
}