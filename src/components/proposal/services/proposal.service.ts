import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { plainToClass } from 'class-transformer';
import { DelegationRepository } from '../../../components/schedule/repositories/delegation.repository';
import {
  AkcLogger, CONST_PROPOSAL_VOTE_OPTION,
  LINK_API,
  RequestContext
} from '../../../shared';
import { ServiceUtil } from '../../../shared/utils/service.util';
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
  private api;

  constructor(
    private readonly logger: AkcLogger,
    private configService: ConfigService,
    private serviceUtil: ServiceUtil,
    private proposalRepository: ProposalRepository,
    private proposalVoteRepository: ProposalVoteRepository,
    private historyProposalRepository: HistoryProposalRepository,
    private proposalDepositRepository: ProposalDepositRepository,
    private delegationRepository: DelegationRepository
  ) {
    this.logger.setContext(ProposalService.name);
    this.api = this.configService.get('API');
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

  async getProposalsByAddress(ctx: RequestContext, address: string): Promise<any> {
    this.logger.log(ctx, `${this.getProposals.name} was called!`);

    const proposals = await this.proposalRepository.getProposalsByAddress(address);

    return { proposals: proposals, count: proposals.length };
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
    let proposal: any = null;
    const proposalData = await this.proposalRepository.findOne({
      where: { pro_id: proposalId },
    });
    if (proposalData) {
      proposal = proposalData;
      proposal.initial_deposit = 0;
      const historyProposal = await this.historyProposalRepository.findOne({
        where: { proposal_id: proposalId },
      });
      if (historyProposal) {
        proposal.initial_deposit = historyProposal.initial_deposit;
      }
      //get quorum
      let data = await this.serviceUtil.getDataAPI(this.api, LINK_API.PARAM_TALLYING, ctx);
      proposal.quorum = 0;
      proposal.threshold = 0;
      proposal.veto_threshold = 0;
      if (data && data.tally_params) {
        proposal.quorum = Number(data.tally_params.quorum) * 100;
        proposal.threshold = Number(data.tally_params.threshold) * 100;
        proposal.veto_threshold = Number(data.tally_params.veto_threshold) * 100;
      }
    }

    return proposal;
  }

  async getProposalByIdNode(ctx: RequestContext, proposalId: string): Promise<any> {
    this.logger.log(ctx, `${this.getProposalById.name} was called!`);
    const params = LINK_API.PROPOSAL_DETAIL + proposalId;
    let data = await this.serviceUtil.getDataAPI(this.api, params, ctx);
    let result = null;
    if (data && data.proposal) {
      result = data.proposal;
    }
    return result;
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
    const paramsBalance = `cosmos/gov/v1beta1/proposals/${proposalId}/tally`;
    const proposalVoteTally = await this.serviceUtil.getDataAPI(this.api, paramsBalance, ctx);
    return { proposalVoteTally: proposalVoteTally };
  }


  async getDelegationsByDelegatorAddress(
    ctx: RequestContext,
    delegatorAddress: string,
  ): Promise<any> {
    this.logger.log(ctx, `${this.getDelegationsByDelegatorAddress.name} was called!`);
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
}
