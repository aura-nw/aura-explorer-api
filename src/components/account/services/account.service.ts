import { HttpService } from '@nestjs/axios';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { lastValueFrom } from 'rxjs';
import { ServiceUtil } from '../../../shared/utils/service.util';
import { ValidatorRepository } from '../../../components/validator/repositories/validator.repository';

import {
  AkcLogger,
  CONST_CHAR,
  CONST_NAME_ASSETS,
  RequestContext,
} from '../../../shared';
import { AccountBalance } from '../dtos/account-balance.dto';
import { AccountDelegation } from '../dtos/account-delegation.dto';
import { AccountOutput } from '../dtos/account-output.dto';
import { AccountRedelegation } from '../dtos/account-redelegation.dto';
import { AccountUnbonding } from '../dtos/account-unbonding.dto';
import { AccountVesting } from '../dtos/account-vesting.dto';

@Injectable()
export class AccountService {
  private api;

  constructor(
    private readonly logger: AkcLogger,
    private httpService: HttpService,
    private configService: ConfigService,
    private serviceUtil: ServiceUtil,
    private validatorRepository: ValidatorRepository,
  ) {
    this.logger.setContext(AccountService.name);
    this.api = this.configService.get('API');
  }

  async getAccountDetailByAddress(ctx: RequestContext, address): Promise<any> {
    this.logger.log(ctx, `${this.getAccountDetailByAddress.name} was called!`);

    const accountOutput = new AccountOutput();
    accountOutput.acc_address = address;

    const paramsBalance = `cosmos/bank/v1beta1/balances/${address}`;
    const paramsDelegated = `cosmos/staking/v1beta1/delegations/${address}`;
    const paramsUnbonding = `cosmos/staking/v1beta1/delegators/${address}/unbonding_delegations`;
    const paramsRedelegations = `cosmos/staking/v1beta1/delegators/${address}/redelegations`;
    const paramsAuthInfo = `auth/accounts/${address}`;
    const paramsStakeReward = `cosmos/distribution/v1beta1/delegators/${address}/rewards`;

    const [
      balanceData,
      delegatedData,
      unbondingData,
      redelegationsData,
      authInfoData,
      validatorData,
      stakeRewardData,
    ] = await Promise.all([
      this.serviceUtil.getDataAPI(this.api, paramsBalance, ctx),
      this.serviceUtil.getDataAPI(this.api, paramsDelegated, ctx),
      this.serviceUtil.getDataAPI(this.api, paramsUnbonding, ctx),
      this.serviceUtil.getDataAPI(this.api, paramsRedelegations, ctx),
      this.serviceUtil.getDataAPI(this.api, paramsAuthInfo, ctx),
      this.validatorRepository.find({
        order: { power: 'DESC' },
      }),
      this.serviceUtil.getDataAPI(this.api, paramsStakeReward, ctx),
    ]);

    // get balance
    let available = 0;
    if (balanceData.balances) {
      accountOutput.balances = new Array(balanceData.balances.length);
      balanceData.balances.forEach((data, idx) => {
        const balance = new AccountBalance();
        if (data.denom === CONST_CHAR.UAURA) {
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

    let delegatedAmount = 0;
    let stakeReward = 0;
    if (delegatedData) {
      accountOutput.delegations = new Array(
        delegatedData.delegation_responses.length,
      );
      delegatedData.delegation_responses.forEach((data, idx) => {
        const validator_address = data.delegation.validator_address;
        const validator = validatorData.filter(
          (e) => e.operator_address === validator_address,
        );
        const reward = stakeRewardData.rewards.filter(
          (e) => e.validator_address === validator_address,
        );
        const delegation = new AccountDelegation();
        delegation.reward = '0';

        if (validator.length > 0) {
          delegation.validator_name = validator[0].title;
          delegation.validator_address = validator_address;
        }
        delegation.amount = this.changeUauraToAura(data.balance.amount);
        if (
          reward.length > 0 &&
          reward[0].reward.length > 0 &&
          reward[0].reward[0].denom === CONST_CHAR.UAURA
        ) {
          delegation.reward = this.changeUauraToAura(
            reward[0].reward[0].amount,
          );
        }
        delegatedAmount += parseInt(data.balance.amount);
        if (
          stakeRewardData &&
          stakeRewardData.total.length > 0 &&
          stakeRewardData.total[0].denom === CONST_CHAR.UAURA
        ) {
          accountOutput.stake_reward = this.changeUauraToAura(
            stakeRewardData.total[0].amount,
          );
          stakeReward = parseInt(stakeRewardData.total[0].amount);
        }
        accountOutput.delegations[idx] = delegation;
      });
      accountOutput.delegations = accountOutput.delegations.filter(
        (item) => item.amount != '0.000000',
      );
      accountOutput.delegated = this.changeUauraToAura(delegatedAmount);
    }

    // get unbonding

    // const unbondingData = await this.getDataAPI(api, paramsUnbonding, ctx);
    let unbondingAmount = 0;
    if (unbondingData) {
      accountOutput.unbonding_delegations = [];
      unbondingData.unbonding_responses.forEach((data, idx) => {
        data.entries?.forEach((item) => {
          const validator_address = data.validator_address;
          const validator = validatorData.filter(
            (e) => e.operator_address === validator_address,
          );
          const unbonding = new AccountUnbonding();

          if (validator.length > 0) {
            unbonding.validator_name = validator[0].title;
            unbonding.validator_address = validator_address;
          }
          unbonding.amount = this.changeUauraToAura(item.balance);
          unbonding.completion_time = item.completion_time;
          unbondingAmount += parseInt(item.balance);

          accountOutput.unbonding_delegations.push(unbonding);
        });
        accountOutput.unbonding = this.changeUauraToAura(unbondingAmount);
      });
    }

    // get redelegations

    // const redelegationsData = await this.getDataAPI(api, paramsRedelegations, ctx);
    if (redelegationsData) {
      accountOutput.redelegations = [];
      redelegationsData.redelegation_responses.forEach((data, idx) => {
        data.entries?.forEach((item) => {
          const validator_src_address = data.redelegation.validator_src_address;
          const validator_dst_address = data.redelegation.validator_dst_address;
          const validatorSrc = validatorData.filter(
            (e) => e.operator_address === validator_src_address,
          );
          const validatorDst = validatorData.filter(
            (e) => e.operator_address === validator_dst_address,
          );
          const redelegation = new AccountRedelegation();

          if (validatorSrc.length > 0) {
            redelegation.validator_src_name = validatorSrc[0].title;
            redelegation.validator_src_address = validator_src_address;
          }
          if (validatorDst.length > 0) {
            redelegation.validator_dst_name = validatorDst[0].title;
            redelegation.validator_dst_address = validator_dst_address;
          }
          redelegation.amount = this.changeUauraToAura(item.balance);
          redelegation.completion_time =
            item.redelegation_entry.completion_time;

          accountOutput.redelegations.push(redelegation);
        });
      });
    }

    // get validator by delegation address
    const validator = validatorData.filter((e) => e.acc_address === address);
    accountOutput.commission = '0';

    // get commission
    let commission = '0';
    if (validator.length > 0) {
      const paramsCommisstion = `cosmos/distribution/v1beta1/validators/${validator[0].operator_address}/commission`;
      const commissionData = await this.serviceUtil.getDataAPI(this.api, paramsCommisstion, ctx);
      if (
        commissionData &&
        commissionData.commission.commission[0].denom === CONST_CHAR.UAURA
      ) {
        commission = commissionData.commission.commission[0].amount;
        accountOutput.commission = this.changeUauraToAura(
          commissionData.commission.commission[0].amount,
        );
      }
    }

    //get auth_info
    // const authInfoData = await this.getDataAPI(api, paramsAuthInfo, ctx);
    let delegatedVesting = 0;
    accountOutput.delegatable_vesting = '0';

    if (authInfoData) {
      const baseVesting = authInfoData.result.value?.base_vesting_account;
      if (baseVesting !== undefined) {
        const vesting = new AccountVesting();
        vesting.type = authInfoData.result.type;
        const originalVesting = baseVesting.original_vesting || [];
        if (originalVesting.length > 0) {
          let originalAmount = 0;
          originalVesting.forEach((item) => {
            originalAmount += Number(item.amount);
          });
          vesting.amount = this.changeUauraToAura(originalAmount);
        }

        const schedule = baseVesting.end_time || 0;
        vesting.vesting_schedule = schedule;
        const delegated: Array<any> = baseVesting.delegated_vesting || [];
        if (delegated.length > 0) {
          let delegatableVesting = 0;
          delegated.forEach((item) => {
            delegatableVesting += Number(item.amount);
          });
          accountOutput.delegatable_vesting =
            this.changeUauraToAura(delegatableVesting);
        }
        accountOutput.vesting = vesting;
      }
    }

    // get total
    const total =
      available +
      delegatedAmount +
      unbondingAmount +
      stakeReward +
      parseFloat(commission) +
      delegatedVesting;
    accountOutput.total = this.changeUauraToAura(total);

    return { ...accountOutput };
  }

  changeUauraToAura(amount) {
    return (amount / 1000000).toFixed(6);
  }
}
