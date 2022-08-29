import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { plainToClass } from 'class-transformer';
import { BlockRepository } from '../../../components/block/repositories/block.repository';
import { DelegationRepository } from '../../../components/schedule/repositories/delegation.repository';
import { BlockService } from '../../../components/block/services/block.service';

import { AkcLogger, CONST_NUM, INDEXER_API, RequestContext, Validator } from '../../../shared';
import { DelegationParamsDto } from '../dtos/delegation-params.dto';

import { ValidatorOutput } from '../dtos/validator-output.dto';
import { ValidatorRepository } from '../repositories/validator.repository';
import { ProposalRepository } from '../../../components/proposal/repositories/proposal.repository';
import { ProposalVoteRepository } from '../../../components/proposal/repositories/proposal-vote.repository';
import { LiteValidatorOutput } from '../dtos/lite-validator-output.dto';
import { DelegationOutput } from '../dtos/delegation-output.dto';
import { DelegatorOutput } from '../dtos/delegator-output';
import { ServiceUtil } from '../../../shared/utils/service.util';
import { UnbondingDelegationsOutput } from '../dtos/unbonding-delegations-output';
import { DelegatorRewardRepository } from '../../../components/schedule/repositories/delegator-reward.repository';
import { DelegatorByValidatorAddrParamsDto } from '../dtos/delegator-by-validator-addr-params.dto';
import { DelegatorByValidatorAddrOutputDto } from '../dtos/delegator-by-validator-addr-output.dto';
import { MoreThan } from 'typeorm';
import * as appConfig from '../../../shared/configs/configuration';
import * as util from 'util';

@Injectable()
export class ValidatorService {
  cosmosScanAPI: string;
  api: string;
  private indexerUrl;
  private indexerChainId;

  constructor(
    private readonly logger: AkcLogger,
    private httpService: HttpService,
    private configService: ConfigService,
    private blockService: BlockService,
    private serviceUtil: ServiceUtil,
    private validatorRepository: ValidatorRepository,
    private delegationRepository: DelegationRepository,
    private blockRepository: BlockRepository,
    private proposalRepository: ProposalRepository,
    private proposalVoteRepository: ProposalVoteRepository,
    private delegatorRewardRepository: DelegatorRewardRepository,
  ) {
    this.logger.setContext(ValidatorService.name);
    const appParams = appConfig.default();
    this.cosmosScanAPI = appParams.cosmosScanAPI;
    this.api = appParams.node.api;
    this.indexerUrl = appParams.indexer.url;
    this.indexerChainId = appParams.indexer.chainId;
  }

  async getTotalValidator(): Promise<number> {
    return await this.validatorRepository.count();
  }

  async getTotalValidatorActive(): Promise<number> {
    return await this.validatorRepository.count({ where: { status: 3 } });
  }

  async getValidators(ctx: RequestContext
  ): Promise<{ validators: LiteValidatorOutput[]; count: number }> {
    this.logger.log(ctx, `${this.getValidators.name} was called!`);

    // get all validator
    const validatorsRes: Validator[] = await this.validatorRepository.getValidators();
    const count = validatorsRes.length;

    const validatorsOutput = plainToClass(LiteValidatorOutput, validatorsRes, {
      excludeExtraneousValues: true,
    });

    // get 50 proposals
    const countProposal = await this.proposalRepository.count({
      order: { pro_id: 'DESC' },
      take: CONST_NUM.LIMIT_50,
      skip: CONST_NUM.OFFSET,
    });

    let cntValidatorActive = 0;
    const validatorActive = validatorsOutput.filter(e => e.jailed !== '0');
    for (let key in validatorActive) {
      const data = validatorActive[key];
      const dataBefore = validatorActive[parseInt(key) - 1];
      if (parseInt(key) === 0) {
        data.cumulative_share_before = '0.00';
        data.cumulative_share = data.percent_power;
        data.cumulative_share_after = data.percent_power;
      } else {
        data.cumulative_share_before = dataBefore.cumulative_share_after;
        data.cumulative_share = data.percent_power;
        const cumulative = parseFloat(data.cumulative_share_before) + parseFloat(data.percent_power);
        data.cumulative_share_after = cumulative.toFixed(2);
      }
    }

    let votersAddress: Array<string> = [];
    for (let key in validatorsOutput) {
      const data = validatorsOutput[key];
      data.rank = parseInt(key) + 1;
      data.target_count = countProposal;
      if (data.jailed === '0') {
        data.status_validator = true;
        cntValidatorActive = cntValidatorActive + 1;
      } else {
        data.status_validator = false;
      }

      // // get count proposal vote by address
      // const countVotes = await this.proposalVoteRepository.count({
      //   where: { voter: data.acc_address },
      // });
      // data.vote_count = countVotes;

      votersAddress.push(data.acc_address);
    }

    validatorsOutput.map((map, idx) => {
      map.rank = idx + 1;
      map.target_count = countProposal;
      if (map.jailed === '0') {
        map.status_validator = true;
        cntValidatorActive = cntValidatorActive + 1;
      } else {
        map.status_validator = false;
      }
      votersAddress.push(map.acc_address);
      return map;
    })

    const countVotes: [] = await this.proposalVoteRepository.countVoteByAddress(votersAddress);
    countVotes.forEach((item: any) => {
      const findValidator = validatorsOutput.find(f => f.acc_address === item.voter);
      if (findValidator) {
        findValidator.vote_count = Number(item.countVote);
      } else {
        findValidator.vote_count = 0;
      }
    });


    return { validators: validatorsOutput, count };
  }

  async getValidatorByAddress(ctx: RequestContext, address: string): Promise<any> {
    this.logger.log(ctx, `${this.getValidatorByAddress.name} was called!`);

    const validator = await this.validatorRepository.getRankByAddress(address);

    const validatorOutput = plainToClass(ValidatorOutput, validator, {
      excludeExtraneousValues: true,
    });

    const minHeight = await this.blockRepository.getHeightValidator(address);

    validatorOutput.bonded_height = 1;
    if (minHeight > 0) {
      validatorOutput.bonded_height = minHeight;
    }

    return validatorOutput;
  }

  async getDelegationByAddress(
    ctx: RequestContext,
    validatorAddress,
    query: DelegationParamsDto,
  ): Promise<{ delegations: DelegationOutput[]; count: number }> {
    this.logger.log(ctx, `${this.getValidatorByAddress.name} was called!`);

    const [delegations, count] = await this.delegationRepository.findAndCount({
      where: { validator_address: validatorAddress },
      order: { amount: 'DESC' },
      take: query.limit,
      skip: query.offset,
    });

    const delegationsOutput = plainToClass(DelegationOutput, delegations, {
      excludeExtraneousValues: true,
    });

    return { delegations: delegationsOutput, count };
  }

  async getDelegations(
    ctx: RequestContext,
    delegatorAddress: string
  ): Promise<any> {
    this.logger.log(ctx, `${this.getDelegations.name} was called!`);
    let result: any = {};
    //get available balance

    // Use promise all to improve performance
    let accountData = await this.serviceUtil.getDataAPI(`${this.indexerUrl}${util.format(INDEXER_API.ACCOUNT_DELEGATIONS, delegatorAddress, this.indexerChainId)}`, '', ctx);
    if (accountData.data === null) {
      accountData = await this.serviceUtil.getDataAPI(`${this.indexerUrl}${util.format(INDEXER_API.ACCOUNT_DELEGATIONS, delegatorAddress, this.indexerChainId)}`, '', ctx);
    }
    const data = accountData.data;
    result.available_balance = 0;
    if (data?.account_balances && data.account_balances?.balances && data.account_balances.balances.length > 0) {
      result.available_balance = Number(data.account_balances.balances[0].amount);
    }
    result.claim_reward = 0;
    const withdrawReward = await this.delegatorRewardRepository.getClaimRewardByDelegatorAddress(delegatorAddress);
    if (withdrawReward) {
      result.claim_reward = Number(withdrawReward?.amount);
    }

    let delegations: any = [];
    const validatorAddress: string[] = [];
    const delegatorAddr: string[] = [];
    if (data?.account_delegations && data.account_delegations?.delegation_responses) {
      const delegationsData = data.account_delegations?.delegation_responses;
      for (let i = 0; i < delegationsData.length; i++) {
        let delegation: any = {};
        let item = delegationsData[i];
        delegation.amount_staked = Number(item.balance.amount);
        delegation.validator_address = item.delegation.validator_address;
        delegation.pending_reward = 0;
        if (data?.account_delegate_rewards && data.account_delegate_rewards?.rewards) {
          const findReward = data.account_delegate_rewards?.rewards.find(i => i.validator_address === item.delegation.validator_address);
          if (findReward && findReward.reward.length > 0) {
            //set reward for item
            delegation.pending_reward = findReward.reward[0].amount;
          }
        }

        delegation.delegator_address = delegatorAddress;
        delegation.validator_address = item.delegation.validator_address;
        delegations.push(delegation);
        validatorAddress.push(item.delegation.validator_address);
        delegatorAddr.push(delegatorAddress);
      }
    }

    if (delegations) {
      const ranks = await this.validatorRepository.getRanks(validatorAddress);
      const delegatorRewards = await this.delegatorRewardRepository.getRewardByAddress(delegatorAddr, validatorAddress);
      for (let i = 0; i < delegations.length; i++) {
        let item = delegations[i];

        // Set Rank for validators
        const rank = ranks.find(f => f.operator_address === item.validator_address);
        if (rank) {
          item.validator_name = rank.title;
          item.validator_rank = rank.rank;
        }

        // Set reward for validators
        const reward = delegatorRewards.find(f => f.validator_address === item.validator_address && f.validator_address === item.validator_address);
        if (reward) {
          item.reward = Number(reward.amount);
        }
      }
    }

    result.delegations = delegations;
    return result;
  }

  /**
   * getDelegators
   * @param operatorAddress 
   * @param delegatorAddress 
   * @returns 
   */
  async getDelegators(operatorAddr: string, delegatorAddr: string) {
    const delegators = await this.validatorRepository.getDelegators(operatorAddr, delegatorAddr);
    if (delegators.length > 0) {
      const delegatorOutputs = plainToClass(DelegatorOutput, delegators, {
        excludeExtraneousValues: true,
      });

      return { data: delegatorOutputs };
    }
    return { data: [] };
  }

  /**
   * unbondingDelegations
   * @param ctx 
   * @param validatorAddr 
   * @returns 
   */
  async unbondingDelegations(ctx: RequestContext, delegatorAddr: string) {
    const params = `cosmos/staking/v1beta1/delegators/${delegatorAddr}/unbonding_delegations`;
    const responses = await this.serviceUtil.getDataAPI(this.api, params, ctx);
    let unbonding_responses = [];
    if (responses) {
      for (let i = 0; i < responses.unbonding_responses?.length; i++) {
        let unbondingRes: UnbondingDelegationsOutput = { ...responses.unbonding_responses[i] };
        const validator = await this.validatorRepository.findOne({ where: { operator_address: unbondingRes.validator_address } });
        if (validator) {
          unbondingRes.validator_name = validator.title;
        }
        unbonding_responses.push(unbondingRes);
      }
    }
    return { data: unbonding_responses };
  }

  /**
   * getDelegatorByValidatorAddr
   * @param validatorAddress 
   * @param limit 
   * @param offset 
   */
  async getDelegatorByValidatorAddr(ctx: RequestContext, validatorAddress: string, params: DelegatorByValidatorAddrParamsDto) {
    const { pageResults, total } = await this.validatorRepository.getDelegatorByValidatorAddr(validatorAddress, params.limit, params.offset);
    const responses = plainToClass(DelegatorByValidatorAddrOutputDto, pageResults, {
      excludeExtraneousValues: true,
    });
    return { data: responses, total };
  }
}
