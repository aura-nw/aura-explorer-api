import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AkcLogger, RequestContext } from "../../../shared";
import { ProposalOutput } from "../dtos/proposal-output.dto";
import { ProposalRepository } from "../repositories/proposal.repository";
import { plainToClass } from 'class-transformer';
import { Interval } from "@nestjs/schedule";
import { lastValueFrom } from "rxjs";
import { HttpService } from "@nestjs/axios";
import { Proposal } from "src/shared/entities/proposal.entity";

@Injectable()
export class ProposalService {
    constructor(
        private readonly logger: AkcLogger,
        private configService: ConfigService,
        private httpService: HttpService,
        private proposalRepository: ProposalRepository
    ) {
        this.logger.setContext(ProposalService.name);
    }

    async getProposals(
        ctx: RequestContext
    ): Promise<{ proposals: ProposalOutput[]; count: number }> {
        this.logger.log(ctx, `${this.getProposals.name} was called!`);

        const [proposals, count] = await this.proposalRepository.findAndCount({
            order: {pro_id: 'DESC'}
        });

        const proposalsOuput = plainToClass(ProposalOutput, proposals, {
            excludeExtraneousValues: true,
        });

        return { proposals: proposalsOuput, count };
    }

    // @Interval(500)
    // async handleInterval() {
    //     const api = this.configService.get<string>('node.api');
    //     try {
    //         //fetching proposals from node
    //         const params = `/cosmos/gov/v1beta1/proposals`;
    //         const data = await this.getDataAPI(api, params);
    //         if (data && data.proposals && data.proposals.length > 0) {
    //             for(let i = 0; i < data.proposals.length; i ++) {
    //                 const item: any = data.proposals[i];
    //                 //create proposal
    //                 let proposal = new Proposal();
    //                 proposal.pro_id = item.proposal_id;
    //                 proposal.pro_title = item.content.title;
    //                 proposal.pro_status = item.status;
    //                 proposal.pro_proposer = '';
    //                 proposal.pro_voting_start_time = item.voting_start_time;
    //                 proposal.pro_voting_end_time = item.voting_end_time;
    //                 proposal.pro_votes_yes = 0.00000000;
    //                 proposal.pro_votes_abstain = 0.00000000;
    //                 proposal.pro_votes_no = 0.00000000;
    //                 proposal.pro_votes_no_with_veto = 0.00000000;
    //                 if (item.final_tally_result) {
    //                     proposal.pro_votes_yes = item.final_tally_result.yes;
    //                     proposal.pro_votes_abstain = item.final_tally_result.abstain;
    //                     proposal.pro_votes_no = item.final_tally_result.no;
    //                     proposal.pro_votes_no_with_veto = item.final_tally_result.no_with_veto;
    //                 }
    //                 proposal.pro_submit_time = item.submit_time;
    //                 proposal.pro_total_deposits = 0.00000000;
    //                 if (item.total_deposit && item.total_deposit.length > 0) {
    //                     proposal.pro_total_deposits = item.total_deposit[0].amount
    //                 }

    //                 // insert into table proposals
    //                 try {
    //                     await this.proposalRepository.save(proposal);
    //                 } catch (error) {
    //                     this.logger.error(null, `Proposal is already existed!`);
    //                 }
    //             }
    //         }

    //     } catch(error) {
    //         this.logger.error(error, `Sync proposals error`);
    //     }
    // }

    async getDataAPI(api, params) {
        const data = await lastValueFrom(this.httpService.get(api + params)).then(
          (rs) => rs.data,
        );
    
        return data;
    }
}