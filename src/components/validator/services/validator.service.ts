import { Injectable } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { AkcLogger, INDEXER_API, RequestContext } from '../../../shared';
import * as util from 'util';
import { ProposalVoteRepository } from '../repositories/proposal-vote.repository';
import * as appConfig from '../../../shared/configs/configuration';
import { ServiceUtil } from '../../../shared/utils/service.util';
import { LiteValidatorOutput } from '../dtos/lite-validator-output.dto';
import { ValidatorOutput } from '../dtos/validator-output.dto';
import { ValidatorRepository } from '../repositories/validator.repository';
import { In } from 'typeorm';
import { ValidatorInfoOutput } from '../dtos/validator-info-output.dto';

@Injectable()
export class ValidatorService {
  api: string;
  private indexerUrl;
  private indexerChainId;
  private coinMinimalDenom: string;

  constructor(
    private readonly logger: AkcLogger,
    private serviceUtil: ServiceUtil,
    private validatorRepository: ValidatorRepository,
    private proposalVoteRepository: ProposalVoteRepository,
  ) {
    this.logger.setContext(ValidatorService.name);
    const appParams = appConfig.default();
    this.api = appParams.node.api;
    this.indexerUrl = appParams.indexer.url;
    this.indexerChainId = appParams.indexer.chainId;
    this.coinMinimalDenom = appParams.chainInfo.coinMinimalDenom;
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
    //FIXME: migrate INDEXER_API.GET_PROPOSAL to horoscope_v2.
    this.logger.log(ctx, `${this.getValidators.name} was called!`);
    const [activeValidator, inActiveValidator, proposal] = await Promise.all([
      this.validatorRepository.getAllActiveValidators(),
      this.validatorRepository.getAllInActiveValidators(),
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

    const validatorsRes = [...activeValidator, ...inActiveValidator];

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

    const validator = await this.validatorRepository.getRankByAddress(address);

    let validatorOutput = new ValidatorOutput();
    if (validator) {
      validatorOutput = plainToClass(ValidatorOutput, validator, {
        excludeExtraneousValues: true,
      });
    }

    return validatorOutput;
  }

  // TODO: will be deleted in the future because fe not use this anymore.
  // async getDelegationByAddress(
  //   ctx: RequestContext,
  //   validatorAddress,
  //   query: DelegationParamsDto,
  // ): Promise<{ delegations: DelegationOutput[]; count: number }> {
  //   this.logger.log(ctx, `${this.getValidatorByAddress.name} was called!`);

  //   const [delegations, count] = await this.delegationRepository.findAndCount({
  //     where: { validator_address: validatorAddress },
  //     order: { amount: 'DESC' },
  //     take: query.limit,
  //     skip: query.offset,
  //   });

  //   const delegationsOutput = plainToClass(DelegationOutput, delegations, {
  //     excludeExtraneousValues: true,
  //   });

  //   return { delegations: delegationsOutput, count };
  // }

  async getDelegations(
    ctx: RequestContext,
    delegatorAddress: string,
  ): Promise<any> {
    //FIXME: migrate INDEXER_API.ACCOUNT_DELEGATIONS to horoscope_v2.
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
    result.claim_reward = 0;

    // Call indexer get data delegations
    const rewards = accountData?.data.account_delegate_rewards?.rewards;
    const totalReward = accountData?.data.account_delegate_rewards?.total?.find(
      (item) => item.denom === this.coinMinimalDenom,
    );
    if (totalReward) {
      result.claim_reward = Number(totalReward?.amount) || 0;
    }

    const delegations: any = [];
    const validatorAddress: string[] = [];
    if (data?.account_delegations) {
      const delegationsData = data.account_delegations;
      for (let i = 0; i < delegationsData?.length; i++) {
        const delegation: any = {};
        const item = delegationsData[i];
        delegation.amount_staked = Number(item.balance.amount);
        delegation.validator_address = item.delegation.validator_address;
        delegation.pending_reward = 0;

        if (rewards?.length > 0) {
          const findReward = rewards.find(
            (i) => i.validator_address === item.delegation.validator_address,
          );
          if (findReward && findReward.reward.length > 0) {
            //set reward for item
            delegation.pending_reward = findReward.reward[0].amount;
          }
        }

        delegation.delegator_address = delegatorAddress;
        delegations.push(delegation);
        validatorAddress.push(item.delegation.validator_address);
      }
    }

    if (delegations.length > 0) {
      const ranks = await this.validatorRepository.getRanks(validatorAddress);
      //TODO: will be deleted in the future because we don't this use anymore.
      // const delegatorRewards =
      //   await this.delegatorRewardRepository.getRewardByAddress(
      //     delegatorAddr,
      //     validatorAddress,
      //   );
      for (let i = 0; i < delegations.length; i++) {
        const item = delegations[i];

        // Set Rank for validators
        const rank = ranks.find(
          (f) => f.operator_address === item.validator_address,
        );
        if (rank) {
          item.validator_name = rank.title;
        }

        // TODO: Set temp data total reward = 0
        item.reward = 0;

        // Set reward for validators
        // const reward = delegatorRewards.find(
        //   (f) => f.validator_address === item.validator_address,
        // );
        // if (reward) {
        //   item.reward = Number(reward.amount);
        // }
      }
    }

    result.delegations = delegations;
    return result;
  }

  // TODO: will be deleted in future because fe not use this anymore.
  // async getDelegationsByDelegatorAddress(
  //   ctx: RequestContext,
  //   delegatorAddress: string,
  // ): Promise<any> {
  //   this.logger.log(
  //     ctx,
  //     `${this.getDelegationsByDelegatorAddress.name} was called!`,
  //   );
  //   //get delegation first
  //   let result: any = {};
  //   result = await this.delegationRepository.findOne({
  //     where: { delegator_address: delegatorAddress },
  //     order: { created_at: 'ASC' },
  //   });
  //   const sumAmount = await this.delegationRepository.getSumAmountByAddress(
  //     delegatorAddress,
  //   );
  //   if (sumAmount && Number(sumAmount.sum) <= 0) {
  //     result = {};
  //   }

  //   return { result: result };
  // }

  /**
   * Get validator info by address
   * @param address
   */
  async getValidatorInfo(
    ctx: RequestContext,
    address: string[],
  ): Promise<ValidatorInfoOutput[]> {
    let validatorOutput = [];
    try {
      const isArray = Array.isArray(address);
      const result = await this.validatorRepository.find({
        where: {
          operator_address: isArray ? In(address) : address,
        },
      });
      if (result) {
        validatorOutput = plainToClass(ValidatorInfoOutput, result, {
          excludeExtraneousValues: true,
        });
      }
    } catch (err) {
      this.logger.error(ctx, err.stack);
    }
    return validatorOutput;
  }
}
