import { HttpService } from '@nestjs/axios';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { lastValueFrom } from 'rxjs';
import { ValidatorRepository } from '../../../components/validator/repositories/validator.repository';

import { AkcLogger, CONST_NAME_ASSETS, RequestContext } from '../../../shared';
import { AccountBalance } from '../dtos/account-balance.dto';
import { AccountDelegation } from '../dtos/account-delegation.dto';
import { AccountOutput } from '../dtos/account-output.dto';
import { AccountRedelegation } from '../dtos/account-redelegation.dto';
import { AccountUnbonding } from '../dtos/account-unbonding.dto';

@Injectable()
export class AccountService {
  constructor(
    private readonly logger: AkcLogger,
    private httpService: HttpService,
    private configService: ConfigService,
    private validatorRepository: ValidatorRepository,
  ) {
    this.logger.setContext(AccountService.name);
  }

  async getDataAPI(api, params, ctx) {
    this.logger.log(
      ctx,
      `${this.getDataAPI.name} was called, to ${api + params}!`,
    );
    const data = await lastValueFrom(this.httpService.get(api + params)).then(
      (rs) => rs.data,
    );

    return data;
  }

  async getAccountDetailByAddress(
    ctx: RequestContext,
    address,
  ): Promise<any> {
    this.logger.log(ctx, `${this.getAccountDetailByAddress.name} was called!`);
    const api = this.configService.get<string>('node.api');
    
    const accountOutput = new AccountOutput();
    accountOutput.acc_address = address;

    // get balance
    const paramsBalance = `/cosmos/bank/v1beta1/balances/${address}`;
    const balanceData = await this.getDataAPI(api, paramsBalance, ctx);
    let available = 0;
    if (balanceData.balances) {
      accountOutput.balances = new Array(balanceData.balances.length); 
      balanceData.balances.forEach((data, idx) => {
        const balance = new AccountBalance();
        if (data.denom === 'uaura') {
          balance.name = CONST_NAME_ASSETS.AURA;
          accountOutput.available = this.changeUauraToAura(data.amount);
          available = parseInt(data.amount);
        }
        balance.denom = data.denom;
        balance.amount = this.changeUauraToAura(data.amount);
        balance.price = 0;
        balance.total_price = balance.price * Number(balance.amount);

        accountOutput.balances[idx] = balance;
      });
    }

    // get delegated
    const paramsDelegated = `/cosmos/staking/v1beta1/delegations/${address}`;
    const delegatedData = await this.getDataAPI(api, paramsDelegated, ctx);
    // get all validator
    const validatorData = await this.validatorRepository.find({ order: { power: 'DESC' } });
    // get stake_reward
    const paramsStakeReward = `/cosmos/distribution/v1beta1/delegators/${address}/rewards`;
    const stakeRewardData = await this.getDataAPI(api, paramsStakeReward, ctx);
    let delegatedAmount = 0;
    let stakeReward = 0;
    if (delegatedData) {
      accountOutput.delegations = new Array(delegatedData.delegation_responses.length); 
      delegatedData.delegation_responses.forEach((data, idx) => {
        const validator_address = data.delegation.validator_address;
        const validator = validatorData.filter(e => e.operator_address === validator_address);
        const reward = stakeRewardData.rewards.filter(e => e.validator_address === validator_address);
        const delegation = new AccountDelegation();
        delegation.reward = '0';

        if (validator.length > 0) {
          delegation.validator_name = validator[0].title;
          delegation.validator_address = validator_address;
        }
        delegation.amount = this.changeUauraToAura(data.balance.amount);
        if (reward.length > 0 && reward[0].reward.length > 0 && reward[0].reward[0].denom === 'uaura') {
          delegation.reward = this.changeUauraToAura(reward[0].reward[0].amount);
        }
        delegatedAmount += parseInt(data.balance.amount);
        if (stakeRewardData && stakeRewardData.total.length > 0 && stakeRewardData.total[0].denom === 'uaura') {
          accountOutput.stake_reward = this.changeUauraToAura(stakeRewardData.total[0].amount);
          stakeReward = parseInt(stakeRewardData.total[0].amount);

        }
        accountOutput.delegations[idx] = delegation; 
      });
      accountOutput.delegated = this.changeUauraToAura(delegatedAmount);
    }

    // get unbonding
    const paramsUnbonding = `/cosmos/staking/v1beta1/delegators/${address}/unbonding_delegations`;
    const unbondingData = await this.getDataAPI(api, paramsUnbonding, ctx);
    let unbondingAmount = 0;
    if (unbondingData) {
      accountOutput.unbonding_delegations = new Array(unbondingData.unbonding_responses.length); 
      unbondingData.unbonding_responses.forEach((data, idx) => {
        const validator_address = data.validator_address;
        const validator = validatorData.filter(e => e.operator_address === validator_address);
        const unbonding = new AccountUnbonding();

        if (validator.length > 0) {
          unbonding.validator_name = validator[0].title;
          unbonding.validator_address = validator_address;
        }
        unbonding.amount = this.changeUauraToAura(data.entries[0].balance);
        unbonding.completion_time = data.entries[0].completion_time;
        unbondingAmount += parseInt(data.entries[0].balance);

        accountOutput.unbonding_delegations[idx] = unbonding;
      });
      accountOutput.unbonding = this.changeUauraToAura(unbondingAmount);
    }

    // get redelegations
    const paramsRedelegations = `/cosmos/staking/v1beta1/delegators/${address}/redelegations`;
    const redelegationsData = await this.getDataAPI(api, paramsRedelegations, ctx);
    if (redelegationsData) {
      accountOutput.redelegations = new Array(redelegationsData.redelegation_responses.length);
      redelegationsData.redelegation_responses.forEach((data, idx) => {
        const validator_src_address = data.redelegation.validator_src_address;
        const validator_dst_address = data.redelegation.validator_dst_address;
        const validatorSrc = validatorData.filter(e => e.operator_address === validator_src_address);
        const validatorDst = validatorData.filter(e => e.operator_address === validator_dst_address);
        const redelegation = new AccountRedelegation();

        if (validatorSrc.length > 0) {
          redelegation.validator_src_name = validatorSrc[0].title;
          redelegation.validator_src_address = validator_src_address;
        }
        if (validatorDst.length > 0) {
          redelegation.validator_dst_name = validatorDst[0].title;
          redelegation.validator_dst_address = validator_dst_address;
        }
        redelegation.amount = this.changeUauraToAura(data.entries[0].balance);
        redelegation.completion_time = data.entries[0].redelegationEntry.completion_time;

        accountOutput.redelegations[idx] = redelegation;
      });
    }

    // get validator by delegation address
    const validator = validatorData.filter(e => e.acc_address === address);
    accountOutput.commission = '0';
    // get commission
    let commission = 0;
    if (validator.length > 0) {
      const paramsCommisstion = `/cosmos/distribution/v1beta1/validators/${validator[0].operator_address}/commission`;
      const commissionData = await this.getDataAPI(api, paramsCommisstion, ctx);
      if (commissionData && commissionData.commission.commission[0].denom === 'uaura') {
        commission = commissionData.commission.commission[0].amount;
        accountOutput.commission = this.changeUauraToAura(commissionData.commission.commission[0].amount);
      }
    }

    const total = available + delegatedAmount + unbondingAmount + stakeReward + commission;
    accountOutput.total = this.changeUauraToAura(total);

    return { ...accountOutput };
  }

  changeUauraToAura(amount) {
    return (amount / 1000000).toFixed(6);
  }
}
