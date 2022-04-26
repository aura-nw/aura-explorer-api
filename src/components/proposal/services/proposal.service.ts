import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Interval } from '@nestjs/schedule';
import { plainToClass } from 'class-transformer';
import { lastValueFrom } from 'rxjs';
import { DelegationRepository } from '../../../components/schedule/repositories/delegation.repository';
import { ValidatorRepository } from '../../../components/validator/repositories/validator.repository';
import {
  AkcLogger, CONST_PROPOSAL_VOTE_OPTION,
  RequestContext
} from '../../../shared';
import { Proposal } from '../../../shared/entities/proposal.entity';
import { ProposalOutput } from '../dtos/proposal-output.dto';
import { ProposalVoteByOptionInput } from '../dtos/proposal-vote-by-option-input.dto';
import { ProposalVoteByValidatorInput } from '../dtos/proposal-vote-by-validator-input.dto';
import { HistoryProposalRepository } from '../repositories/history-proposal.reponsitory';
import { ProposalDepositRepository } from '../repositories/proposal-deposit.repository';
import { ProposalVoteRepository } from '../repositories/proposal-vote.repository';
import { ProposalRepository } from '../repositories/proposal.repository';

@Injectable()
export class ProposalService {
  isSync = false;

  constructor(
    private readonly logger: AkcLogger,
    private configService: ConfigService,
    private httpService: HttpService,
    private proposalRepository: ProposalRepository,
    private proposalVoteRepository: ProposalVoteRepository,
    private validatorRepository: ValidatorRepository,
    private historyProposalRepository: HistoryProposalRepository,
    private proposalDepositRepository: ProposalDepositRepository,
    private delegationRepository: DelegationRepository
  ) {
    this.logger.setContext(ProposalService.name);
  }

  async getProposals(ctx: RequestContext): Promise<any> {
    this.logger.log(ctx, `${this.getProposals.name} was called!`);

    const [proposals, count] = await this.proposalRepository.findAndCount({
      where: { is_delete: false },
      order: { pro_id: 'DESC' },
    });

    const proposalsOuput = plainToClass(ProposalOutput, proposals, {
      excludeExtraneousValues: true,
    });

    return { proposals: proposalsOuput, count };
  }

  async getProposalVote(
    ctx: RequestContext,
    proposalId: string,
    voter: string,
  ): Promise<any> {
    this.logger.log(ctx, `${this.getProposalVote.name} was called!`);
    const proposalVote = await this.proposalVoteRepository.findOne({
      where: { proposal_id: proposalId, voter: voter },
    });

    return { proposalVote: proposalVote };
  }

  async getProposalById(ctx: RequestContext, proposalId: string): Promise<any> {
    this.logger.log(ctx, `${this.getProposalById.name} was called!`);
    let proposal: any = {};
    proposal = await this.proposalRepository.findOne({
      where: { pro_id: proposalId },
    });
    proposal.initial_deposit = 0;
    const historyProposal = await this.historyProposalRepository.findOne({
      where: { proposal_id: proposalId },
    });
    if (historyProposal) {
      proposal.initial_deposit = historyProposal.initial_deposit;
    }
    return proposal;
  }

  async getVotesListByOption(
    ctx: RequestContext,
    request: ProposalVoteByOptionInput,
  ): Promise<any> {
    this.logger.log(ctx, `${this.getVotesListByOption.name} was called!`);
    const proposalVotes =
      await this.proposalVoteRepository.getProposalVotesByOption(request);
    let result: any = {};
    result.proposalVotes = proposalVotes;
    const votes = await this.proposalVoteRepository.find({
      where: { proposal_id: request.proposalId },
    });
    result.countTotal = votes.length;
    result.countYes = 0;
    result.countAbstain = 0;
    result.countNo = 0;
    result.countNoWithVeto = 0;
    if (result.countTotal > 0) {
      result.countYes = votes.filter(function (item) {
        return item.option === CONST_PROPOSAL_VOTE_OPTION.YES;
      }).length;
      result.countAbstain = votes.filter(function (item) {
        return item.option === CONST_PROPOSAL_VOTE_OPTION.ABSTAIN;
      }).length;
      result.countNo = votes.filter(function (item) {
        return item.option === CONST_PROPOSAL_VOTE_OPTION.NO;
      }).length;
      result.countNoWithVeto = votes.filter(function (item) {
        return item.option === CONST_PROPOSAL_VOTE_OPTION.NO_WITH_VETO;
      }).length;
    }

    return { result: result };
  }

  async getVotesListByValidator(
    ctx: RequestContext,
    request: ProposalVoteByValidatorInput,
  ): Promise<any> {
    this.logger.log(ctx, `${this.getVotesListByValidator.name} was called!`);
    const proposalVotes =
      await this.proposalVoteRepository.getProposalVotesByValidator(
        request,
        true
      );
    let result: any = {};
    result.proposalVotes = proposalVotes;
    const votes = await this.proposalVoteRepository.getProposalVotesByValidator(
      request,
      false
    );
    result.countTotal = votes.length
    result.countYes = 0;
    result.countAbstain = 0;
    result.countNo = 0;
    result.countNoWithVeto = 0;
    result.countDidNotVote = 0;
    if (result.countTotal > 0) {
      result.countYes = votes.filter(function (item) {
        return item.option === CONST_PROPOSAL_VOTE_OPTION.YES;
      }).length;
      result.countAbstain = votes.filter(function (item) {
        return item.option === CONST_PROPOSAL_VOTE_OPTION.ABSTAIN;
      }).length;
      result.countNo = votes.filter(function (item) {
        return item.option === CONST_PROPOSAL_VOTE_OPTION.NO;
      }).length;
      result.countNoWithVeto = votes.filter(function (item) {
        return item.option === CONST_PROPOSAL_VOTE_OPTION.NO_WITH_VETO;
      }).length;
    }
    result.countDidNotVote = votes.length - (result.countYes + result.countAbstain + result.countNo + result.countNoWithVeto);

    return { result: result };
  }

  async getDepositListById(
    ctx: RequestContext,
    proposalId: string,
  ): Promise<any> {
    this.logger.log(ctx, `${this.getDepositListById.name} was called!`);
    const proposalDeposits = await this.proposalDepositRepository.find({
      where: { proposal_id: proposalId },
      order: { created_at: 'DESC' },
    });

    return { result: proposalDeposits };
  }

  async getProposalVoteTally(
    ctx: RequestContext,
    proposalId: string,
  ): Promise<any> {
    this.logger.log(ctx, `${this.getProposalVoteTally.name} was called!`);
    const api = this.configService.get<string>('node.api');
    const paramsBalance = `/cosmos/gov/v1beta1/proposals/${proposalId}/tally`;
    const proposalVoteTally = await this.getDataAPI(api, paramsBalance);
    return { proposalVoteTally: proposalVoteTally };
  }

  async getProposalsFromNode(
  ): Promise<any> {
    let key: string = '';
    const api = this.configService.get<string>('node.api');
    const params = `/cosmos/gov/v1beta1/proposals`;
    let result = await this.getDataAPI(api, params);
    key = result.pagination.next_key;
    while (key != null) {
      const params = `/cosmos/gov/v1beta1/proposals?pagination.key=${key}`;
      let dataProposal = await this.getDataAPI(api, params);
      key = dataProposal.pagination.next_key;
      result = [...result.proposals, ...dataProposal.proposals];
    }
    return result;
  }

  @Interval(500)
  async handleInterval() {
    const api = this.configService.get<string>('node.api');
    // check status
    if (this.isSync) {
      this.logger.log(null, 'already syncing proposals... wait');
      return;
    } else {
      this.logger.log(null, 'fetching data proposals...');
    }
    try {
      //fetching proposals from node
      const data = await this.getProposalsFromNode();
      this.isSync = true;

      if (data && data && data.length > 0) {
        for (let i = 0; i < data.length; i++) {
          const item: any = data[i];
          //create proposal
          let proposal = new Proposal();
          proposal.pro_id = Number(item.proposal_id);
          proposal.pro_title = item.content['title'];
          proposal.pro_description = item.content['description'];
          proposal.pro_status = item.status;
          proposal.pro_proposer_address = '';
          proposal.pro_proposer = '';
          const paramsProposer = `/gov/proposals/${item.proposal_id}/proposer`;
          const dataProposer = await this.getDataAPI(api, paramsProposer);
          if (dataProposer && dataProposer.result) {
            proposal.pro_proposer_address = dataProposer.result.proposer;
            //get validator
            const validator = await this.validatorRepository.findOne({
              where: { acc_address: dataProposer.result.proposer },
            });
            if (validator) {
              proposal.pro_proposer = validator.title;
            }
          }
          proposal.pro_voting_start_time = new Date(item.voting_start_time);
          proposal.pro_voting_end_time = new Date(item.voting_end_time);
          proposal.pro_votes_yes = 0.0;
          proposal.pro_votes_abstain = 0.0;
          proposal.pro_votes_no = 0.0;
          proposal.pro_votes_no_with_veto = 0.0;
          if (item.final_tally_result) {
            proposal.pro_votes_yes = item.final_tally_result.yes;
            proposal.pro_votes_abstain = item.final_tally_result.abstain;
            proposal.pro_votes_no = item.final_tally_result.no;
            proposal.pro_votes_no_with_veto =
              item.final_tally_result.no_with_veto;
          }
          proposal.pro_submit_time = new Date(item.submit_time);
          proposal.pro_total_deposits = 0.0;
          if (item.total_deposit && item.total_deposit.length > 0) {
            proposal.pro_total_deposits = item.total_deposit[0].amount;
          }
          //set value for column not null
          proposal.pro_tx_hash = '';
          proposal.pro_type = item.content['@type'];
          proposal.pro_deposit_end_time = new Date(item.deposit_end_time);
          proposal.is_delete = false;
          proposal.pro_activity = '{"key": "activity", "value": ""}'; //tmp value
          // insert into table proposals
          try {
            await this.proposalRepository.save(proposal);
          } catch (error) {
            this.logger.error(null, `Proposal is already existed!`);
          }
        }
        //delete proposal failed
        const listId = data.map((i) => Number(i.proposal_id));
        await this.proposalRepository.deleteProposalsByListId(listId);
        this.isSync = false;
      }
    } catch (error) {
      this.logger.error(error, `Sync proposals error`);
      this.isSync = false;
    }
  }

  async getDelegationsByDelegatorAddress(
    ctx: RequestContext,
    delegatorAddress: string,
  ): Promise<any> {
    this.logger.log(ctx, `${this.getDelegationsByDelegatorAddress.name} was called!`);
    const api = this.configService.get<string>('node.api');
    //get delegation first
    let result: any = {};
    result = await this.delegationRepository.findOne({
      where: { delegator_address: delegatorAddress },
      order: { created_at: 'ASC' }
    });
    const stakeData = await this.delegationRepository.find({
      where: { delegator_address: delegatorAddress }
    });
    if (stakeData.length > 0 && stakeData.reduce((a, curr) => a + curr.amount, 0) <= 0) {
      result = {};
    }

    return { result: result };
  }

  async getDataAPI(api, params) {
    const data = await lastValueFrom(this.httpService.get(api + params)).then(
      (rs) => rs.data,
    );

    return data;
  }
}
