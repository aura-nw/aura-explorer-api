import { Injectable } from '@nestjs/common';
import { ValidatorRepository } from '../../../components/validator/repositories/validator.repository';
import { ServiceUtil } from '../../../shared/utils/service.util';

import * as util from 'util';
import { AkcLogger, INDEXER_API, RequestContext } from '../../../shared';
import * as appConfig from '../../../shared/configs/configuration';
import { AccountBalance } from '../dtos/account-balance.dto';
import { AccountDelegation } from '../dtos/account-delegation.dto';
import { AccountOutput } from '../dtos/account-output.dto';
import { AccountRedelegation } from '../dtos/account-redelegation.dto';
import { AccountUnbonding } from '../dtos/account-unbonding.dto';
import { AccountVesting } from '../dtos/account-vesting.dto';

@Injectable()
export class AccountService {
  private api;
  private indexerUrl;
  private indexerChainId;
  private denom;
  private minimalDenom;
  private precisionDiv;
  private decimals;

  constructor(
    private readonly logger: AkcLogger,
    private serviceUtil: ServiceUtil,
    private validatorRepository: ValidatorRepository,
  ) {
    this.logger.setContext(AccountService.name);
    const appParams = appConfig.default();
    this.api = appParams.node.api;
    this.indexerUrl = appParams.indexer.url;
    this.indexerChainId = appParams.indexer.chainId;
    this.minimalDenom = appParams.chainInfo.coinMinimalDenom;
    this.denom = appParams.chainInfo.coinDenom;
    this.precisionDiv = appParams.chainInfo.precisionDiv;
    this.decimals = appParams.chainInfo.coinDecimals;
  }

  async getAccountDetailByAddress(
    ctx: RequestContext,
    address: string,
  ): Promise<any> {
    this.logger.log(ctx, `${this.getAccountDetailByAddress.name} was called!`);

    const accountOutput = new AccountOutput();
    accountOutput.acc_address = address;

    const [accountData, validatorData] = await Promise.all([
      this.serviceUtil.getDataAPI(
        `${this.indexerUrl}${util.format(
          INDEXER_API.ACCOUNT_INFO,
          address,
          this.indexerChainId,
        )}`,
        '',
        ctx,
      ),
      this.validatorRepository.find({
        order: { power: 'DESC' },
      }),
    ]);

    if (!accountData?.data) {
      return accountData;
    }

    const data = accountData.data;
    // get balance
    let balancesAmount = 0;
    if (data?.account_balances) {
      const balances = data.account_balances;
      accountOutput.balances = new Array(balances.length);
      balances.forEach((item) => {
        const balance = new AccountBalance();
        if (item.denom === this.minimalDenom) {
          balance.name = this.denom;
          balance.denom = item.denom;
          balance.amount = this.changeUauraToAura(item.amount);
          // todo
          balance.price = 0;
          balance.total_price = balance.price * Number(balance.amount);
          balancesAmount = parseFloat(item.amount);
          accountOutput.balances.push(balance);
        }
      });
    }

    // Get available
    let available = 0;
    accountOutput.available = this.changeUauraToAura(available);
    if (data?.account_spendable_balances) {
      const uaura = data.account_spendable_balances?.find(
        (f) => f.denom === this.minimalDenom,
      );
      if (uaura) {
        const amount = uaura.amount;
        accountOutput.available = this.changeUauraToAura(amount);
        available = parseFloat(amount);
      }
    }

    // Get delegate
    let delegatedAmount = 0;
    let stakeReward = 0;
    if (data?.account_delegations) {
      accountOutput.delegations = [];
      data.account_delegations.forEach((item, idx) => {
        const validator_address = item.delegation.validator_address;
        const validator = validatorData.filter(
          (e) => e.operator_address === validator_address,
        );
        const reward = data.account_delegate_rewards.rewards.filter(
          (e) => e.validator_address === validator_address,
        );
        const delegation = new AccountDelegation();
        delegation.reward = '0';

        if (validator.length > 0) {
          delegation.validator_name = validator[0].title;
          delegation.validator_address = validator_address;
          delegation.validator_identity = validator[0].identity;
          delegation.jailed = Number(validator[0].jailed);
        }
        delegation.amount = this.changeUauraToAura(item.balance.amount);
        if (
          reward.length > 0 &&
          reward[0].reward.length > 0 &&
          reward[0].reward[0].denom === this.minimalDenom
        ) {
          delegation.reward = this.changeUauraToAura(
            reward[0].reward[0].amount,
          );
        }
        delegatedAmount += parseInt(item.balance.amount);
        if (
          data?.account_delegate_rewards &&
          data.account_delegate_rewards?.total &&
          data.account_delegate_rewards.total.length > 0 &&
          data.account_delegate_rewards.total[0].denom === this.minimalDenom
        ) {
          accountOutput.stake_reward = this.changeUauraToAura(
            data.account_delegate_rewards?.total[0].amount,
          );
          stakeReward = parseInt(
            data.account_delegate_rewards?.total[0].amount,
          );
        }
        accountOutput.delegations[idx] = delegation;
      });
      accountOutput.delegations = accountOutput.delegations.filter(
        (item) => item.amount != '0.000000',
      );
      accountOutput.delegated = this.changeUauraToAura(delegatedAmount);
    }

    // get unbonding
    let unbondingAmount = 0;
    if (data?.account_unbonding) {
      accountOutput.unbonding_delegations = [];
      data.account_unbonding?.forEach((item) => {
        item.entries?.forEach((item1) => {
          const validator_address = item.validator_address;
          const validator = validatorData.filter(
            (e) => e.operator_address === validator_address,
          );
          const unbonding = new AccountUnbonding();

          if (validator.length > 0) {
            unbonding.validator_name = validator[0].title;
            unbonding.validator_address = validator_address;
            unbonding.validator_identity = validator[0].identity;
            unbonding.jailed = Number(validator[0].jailed);
          }
          unbonding.amount = this.changeUauraToAura(item1.balance);
          unbonding.completion_time = item1.completion_time;
          unbondingAmount += parseInt(item1.balance);

          accountOutput.unbonding_delegations.push(unbonding);
        });
        accountOutput.unbonding = this.changeUauraToAura(unbondingAmount);
      });
      accountOutput.unbonding_delegations.sort(
        (a, b) => Date.parse(a.completion_time) - Date.parse(b.completion_time),
      );
    }

    // get redelegations
    if (data?.account_redelegations) {
      accountOutput.redelegations = [];
      data.account_redelegations.forEach((item) => {
        item.entries?.forEach((item1) => {
          const validator_src_address = item.redelegation.validator_src_address;
          const validator_dst_address = item.redelegation.validator_dst_address;
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
            redelegation.validator_src_identity = validatorSrc[0].identity;
            redelegation.validator_src_jailed = Number(validatorSrc[0].jailed);
          }
          if (validatorDst.length > 0) {
            redelegation.validator_dst_name = validatorDst[0].title;
            redelegation.validator_dst_address = validator_dst_address;
            redelegation.validator_dst_identity = validatorDst[0].identity;
            redelegation.validator_dst_jailed = Number(validatorDst[0].jailed);
          }
          redelegation.amount = this.changeUauraToAura(item1.balance);
          redelegation.completion_time =
            item1.redelegation_entry.completion_time;

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
      const commissionData = await this.serviceUtil.getDataAPI(
        this.api,
        paramsCommisstion,
        ctx,
      );
      if (
        commissionData &&
        commissionData.commission.commission[0].denom === this.minimalDenom
      ) {
        commission = commissionData.commission.commission[0].amount;
        accountOutput.commission = this.changeUauraToAura(
          commissionData.commission.commission[0].amount,
        );
      }
    }

    //get auth_info
    let delegatedVesting = 0;
    accountOutput.delegable_vesting = '0';
    if (balancesAmount > 0) {
      delegatedVesting = balancesAmount - available;
      accountOutput.delegable_vesting =
        this.changeUauraToAura(delegatedVesting);
    }

    // Get vesting
    if (data?.account_auth) {
      const baseVesting = data.account_auth.result?.value?.base_vesting_account;
      if (baseVesting !== undefined) {
        const vesting = new AccountVesting();
        vesting.type = data.account_auth.result.type;
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
    return (amount / this.precisionDiv).toFixed(this.decimals);
  }
}
