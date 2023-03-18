import { Injectable } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { DelegationRepository } from '../repositories/delegation.repository';

import {
  AkcLogger,
  INDEXER_API,
  LINK_API,
  RequestContext,
} from '../../../shared';
import { DelegationParamsDto } from '../dtos/delegation-params.dto';

import * as util from 'util';
import { ProposalVoteRepository } from '../repositories/proposal-vote.repository';
import { DelegatorRewardRepository } from '../repositories/delegator-reward.repository';
import * as appConfig from '../../../shared/configs/configuration';
import { ServiceUtil } from '../../../shared/utils/service.util';
import { DelegationOutput } from '../dtos/delegation-output.dto';
import { LiteValidatorOutput } from '../dtos/lite-validator-output.dto';
import { ValidatorOutput } from '../dtos/validator-output.dto';
import { ValidatorRepository } from '../repositories/validator.repository';

@Injectable()
export class ValidatorService {
  cosmosScanAPI: string;
  api: string;
  private indexerUrl;
  private indexerChainId;
  private coinDenom: string;

  constructor(
    private readonly logger: AkcLogger,
    private serviceUtil: ServiceUtil,
    private validatorRepository: ValidatorRepository,
    private delegationRepository: DelegationRepository,
    private proposalVoteRepository: ProposalVoteRepository,
    private delegatorRewardRepository: DelegatorRewardRepository,
  ) {
    this.logger.setContext(ValidatorService.name);
    const appParams = appConfig.default();
    this.cosmosScanAPI = appParams.cosmosScanAPI;
    this.api = appParams.node.api;
    this.indexerUrl = appParams.indexer.url;
    this.indexerChainId = appParams.indexer.chainId;
    this.coinDenom = appParams.chainInfo.coinDenom;
  }

  async getTotalValidator(): Promise<number> {
    return await this.validatorRepository.count();
  }

  async getTotalValidatorActive(): Promise<number> {
    return await this.validatorRepository.count({ where: { status: 3 } });
  }

  async getValidators(
    ctx: RequestContext,
  ): Promise<{ validators: LiteValidatorOutput[] }> {
    this.logger.log(ctx, `${this.getValidators.name} was called!`);
    const [validatorsRes, proposal] = await Promise.all([
      this.validatorRepository.getAllValidators(),
      this.serviceUtil.getDataAPI(
        `${this.indexerUrl}${util.format(
          INDEXER_API.GET_PROPOSAL,
          this.indexerChainId,
          1,
          0,
        )}`,
        '',
        ctx,
      ),
    ]);

    // Get total proposal on indexer
    const proposalCount = proposal?.data?.count || 0;

    const validatorsOutput = plainToClass(LiteValidatorOutput, validatorsRes, {
      excludeExtraneousValues: true,
    });

    let cntValidatorActive = 0;
    const validatorActive = validatorsOutput.filter((e) => e.jailed !== '0');
    for (const key in validatorActive) {
      const data = validatorActive[key];
      const dataBefore = validatorActive[parseInt(key) - 1];
      if (parseInt(key) === 0) {
        data.cumulative_share_before = '0.00';
        data.cumulative_share = data.percent_power;
        data.cumulative_share_after = data.percent_power;
      } else {
        data.cumulative_share_before = dataBefore.cumulative_share_after;
        data.cumulative_share = data.percent_power;
        const cumulative =
          parseFloat(data.cumulative_share_before) +
          parseFloat(data.percent_power);
        data.cumulative_share_after = cumulative.toFixed(2);
      }
    }

    const votersAddress: Array<string> = [];
    for (const key in validatorsOutput) {
      const data = validatorsOutput[key];
      data.rank = parseInt(key) + 1;
      data.target_count = proposalCount;
      if (data.jailed === '0') {
        data.status_validator = true;
        cntValidatorActive = cntValidatorActive + 1;
      } else {
        data.status_validator = false;
      }

      votersAddress.push(data.acc_address);
    }

    validatorsOutput.map((map, idx) => {
      map.rank = idx + 1;
      map.target_count = proposalCount;
      if (map.jailed === '0') {
        map.status_validator = true;
        cntValidatorActive = cntValidatorActive + 1;
      } else {
        map.status_validator = false;
      }
      votersAddress.push(map.acc_address);
      return map;
    });

    const countVotes: any[] =
      await this.proposalVoteRepository.countVoteByAddress(votersAddress);
    countVotes.forEach((item: any) => {
      const findValidator = validatorsOutput.find(
        (f) => f.acc_address === item.voter,
      );
      if (findValidator) {
        findValidator.vote_count = Number(item.countVote);
      } else {
        findValidator.vote_count = 0;
      }
    });

    return { validators: validatorsOutput };
  }

  async getValidatorByAddress(
    ctx: RequestContext,
    address: string,
  ): Promise<any> {
    this.logger.log(ctx, `${this.getValidatorByAddress.name} was called!`);

    const requestUrl = `${this.indexerUrl}${util.format(
      INDEXER_API.GET_VALIDATOR_BY_ADDRESS,
      this.indexerChainId,
      address,
    )}`;

    const [validator, validatorResponse] = await Promise.all([
      this.validatorRepository.getRankByAddress(address),
      this.serviceUtil.getDataAPI(requestUrl, '', ctx),
    ]);

    let validatorOutput = new ValidatorOutput();
    if (validator) {
      validatorOutput = plainToClass(ValidatorOutput, validator, {
        excludeExtraneousValues: true,
      });

      validatorOutput.bonded_height = 1;
      const validators = validatorResponse?.data?.validators || [];
      if (validators?.length > 0) {
        validatorOutput.bonded_height =
          Number(validators[0].val_signing_info?.start_height) || 1;
      }
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
    delegatorAddress: string,
  ): Promise<any> {
    this.logger.log(ctx, `${this.getDelegations.name} was called!`);
    const result: any = {};
    const accountData = await this.serviceUtil.getDataAPI(
      `${this.indexerUrl}${util.format(
        INDEXER_API.ACCOUNT_DELEGATIONS,
        delegatorAddress,
        this.indexerChainId,
      )}`,
      '',
      ctx,
    );

    if (!accountData?.data) {
      return accountData;
    }

    const data = accountData.data;
    result.available_balance = 0;
    if (data?.account_balances && data.account_balances.length > 0) {
      result.available_balance = Number(data.account_balances[0].amount);
    }
    result.claim_reward = 0;

    // Call indexer get data delegations
    const rewards = accountData?.account_delegate_rewards?.rewards;
    const totalReward = accountData?.account_delegate_rewards?.total;
    if (totalReward) {
      const total = rewards?.total.find(
        (item) => item.denom === this.coinDenom,
      );
      if (total) {
        result.claim_reward = Number(total?.amount);
      }
    }

    const delegations: any = [];
    const validatorAddress: string[] = [];
    const delegatorAddr: string[] = [];
    if (data?.account_delegations) {
      const delegationsData = data.account_delegations;
      for (let i = 0; i < delegationsData?.length; i++) {
        const delegation: any = {};
        const item = delegationsData[i];
        delegation.amount_staked = Number(item.balance.amount);
        delegation.validator_address = item.delegation.validator_address;
        delegation.pending_reward = 0;
        if (
          data?.account_delegate_rewards &&
          data.account_delegate_rewards?.rewards
        ) {
          const findReward = data.account_delegate_rewards?.rewards.find(
            (i) => i.validator_address === item.delegation.validator_address,
          );
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

    if (delegations.length > 0) {
      const ranks = await this.validatorRepository.getRanks(validatorAddress);
      for (let i = 0; i < rewards?.length; i++) {
        const item = delegations[i];

        // Set Rank for validators
        const rank = ranks.find(
          (f) =>
            f.operator_address === item.validator_address &&
            item.reward?.denom === this.coinDenom,
        );
        if (rank) {
          item.validator_name = rank.title;
          item.validator_rank = rank.rank;
          item.validator_identity = rank.identity;
          item.jailed = rank.jailed;
        }

        // Set reward for validators
        const reward = rewards.find(
          (f) => f.validator_address === item.validator_address,
        );
        if (reward) {
          item.reward = Number(reward.amount);
        }
      }
    }

    result.delegations = delegations;
    return result;
  }

  async getDelegationsByDelegatorAddress(
    ctx: RequestContext,
    delegatorAddress: string,
  ): Promise<any> {
    this.logger.log(
      ctx,
      `${this.getDelegationsByDelegatorAddress.name} was called!`,
    );
    //get delegation first
    let result: any = {};
    result = await this.delegationRepository.findOne({
      where: { delegator_address: delegatorAddress },
      order: { created_at: 'ASC' },
    });
    const sumAmount = await this.delegationRepository.getSumAmountByAddress(
      delegatorAddress,
    );
    if (sumAmount && Number(sumAmount.sum) <= 0) {
      result = {};
    }

    return { result: result };
  }
}
