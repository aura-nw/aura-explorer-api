import { Injectable } from '@nestjs/common';
import { ServiceUtil } from '../../../shared/utils/service.util';

import * as util from 'util';
import { AkcLogger, INDEXER_API_V2, RequestContext } from '../../../shared';
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
  private denom;
  private minimalDenom;
  private precisionDiv;
  private decimals;
  private chainDB;

  constructor(
    private readonly logger: AkcLogger,
    private serviceUtil: ServiceUtil,
  ) {
    this.logger.setContext(AccountService.name);
    const appParams = appConfig.default();
    this.api = appParams.node.api;
    this.minimalDenom = appParams.chainInfo.coinMinimalDenom;
    this.denom = appParams.chainInfo.coinDenom;
    this.precisionDiv = appParams.chainInfo.precisionDiv;
    this.decimals = appParams.chainInfo.coinDecimals;
    this.chainDB = appParams.indexerV2.chainDB;
  }

  async getAccountDetailByAddress(
    ctx: RequestContext,
    address: string,
  ): Promise<any> {
    this.logger.log(ctx, `${this.getAccountDetailByAddress.name} was called!`);

    const accountOutput = new AccountOutput();
    accountOutput.acc_address = address;

    // get account detail
    const accountAttributes = `type
      sequence
      spendable_balances
      pubkey
      id
      balances
      account_number
      address`;

    const graphqlQueryAcc = {
      query: util.format(
        INDEXER_API_V2.GRAPH_QL.ACCOUNT,
        this.chainDB,
        accountAttributes,
      ),
      variables: {
        address: address,
      },
      operationName: INDEXER_API_V2.OPERATION_NAME.ACCOUNT,
    };

    // get validator list
    const validatorAttributes = `jailed
      image_url
      description
      account_address
      operator_address`;

    const graphqlQueryVal = {
      query: util.format(
        INDEXER_API_V2.GRAPH_QL.VALIDATORS,
        this.chainDB,
        validatorAttributes,
      ),
      variables: {},
      operationName: INDEXER_API_V2.OPERATION_NAME.VALIDATORS,
    };

    const delegationsParam = `cosmos/staking/v1beta1/delegations/${address}`;
    const unbondingParam = `cosmos/staking/v1beta1/delegators/${address}/unbonding_delegations`;
    const redelegationsParam = `cosmos/staking/v1beta1/delegators/${address}/redelegations`;
    const paramAccount = `/cosmos/auth/v1beta1/accounts/${address}`;

    const [
      account,
      validators,
      delegationsResponse,
      unbondingResponse,
      redelegationsResponse,
      accountResponse,
    ] = await Promise.all([
      this.serviceUtil.fetchDataFromGraphQL(graphqlQueryAcc),
      this.serviceUtil.fetchDataFromGraphQL(graphqlQueryVal),
      this.serviceUtil.getDataAPI(this.api, delegationsParam, ctx),
      this.serviceUtil.getDataAPI(this.api, unbondingParam, ctx),
      this.serviceUtil.getDataAPI(this.api, redelegationsParam, ctx),
      this.serviceUtil.getDataAPI(this.api, paramAccount, ctx),
    ]);

    const accountData = account?.data[this.chainDB]['account'];
    const data = accountData[0];
    const validatorData = validators?.data[this.chainDB]['validator'];
    if (!data) {
      return accountData;
    }

    // get balance
    let balancesAmount = 0;
    const balances = data.balances?.length ? data.balances : [];
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

    // Get available
    let available = 0;
    accountOutput.available = this.changeUauraToAura(available);
    if (data?.spendable_balances) {
      const spendable_balances = data.spendable_balances?.length
        ? data.spendable_balances
        : [];
      const uaura = spendable_balances?.find(
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
    const accountDelegations = [...delegationsResponse.delegation_responses];
    let nextKey = delegationsResponse?.pagination?.next_key;
    // Get additional data if have nextKey
    while (!!nextKey) {
      const delegationsParam = `cosmos/staking/v1beta1/delegations/${address}?pagination.key=${nextKey}`;
      const delegationsResponse = await this.serviceUtil.getDataAPI(
        this.api,
        delegationsParam,
        ctx,
      );
      nextKey = delegationsResponse?.pagination?.next_key;
      accountDelegations.push(...delegationsResponse.delegation_responses);
    }

    if (accountDelegations.length > 0) {
      accountOutput.delegations = [];
      const delegateRewardParam = `cosmos/distribution/v1beta1/delegators/${address}/rewards`;
      const delegationsRewardRespone = await this.serviceUtil.getDataAPI(
        this.api,
        delegateRewardParam,
        ctx,
      );
      accountDelegations.forEach((item, idx) => {
        const validator_address = item.delegation.validator_address;
        const validator = validatorData.filter(
          (e) => e.operator_address === validator_address,
        );
        const reward = delegationsRewardRespone?.rewards.filter(
          (e) => e.validator_address === validator_address,
        );
        const delegation = new AccountDelegation();
        delegation.reward = '0';

        if (validator.length > 0) {
          delegation.validator_name = validator[0].description?.moniker;
          delegation.validator_address = validator_address;
          delegation.validator_identity = validator[0].description?.identity;
          delegation.image_url = validator[0].image_url;
          delegation.jailed = Number(validator[0].jailed);
        }
        delegation.amount = this.changeUauraToAura(item.balance.amount);
        if (
          reward.length > 0 &&
          reward[0].reward?.length > 0 &&
          reward[0].reward[0].denom === this.minimalDenom
        ) {
          delegation.reward = this.changeUauraToAura(
            reward[0].reward[0].amount,
          );
        }
        delegatedAmount += parseInt(item.balance.amount);
        if (
          delegationsRewardRespone &&
          delegationsRewardRespone.total &&
          delegationsRewardRespone.total.length > 0 &&
          delegationsRewardRespone.total[0].denom === this.minimalDenom
        ) {
          accountOutput.stake_reward = this.changeUauraToAura(
            delegationsRewardRespone?.total[0].amount,
          );
          stakeReward = parseInt(delegationsRewardRespone?.total[0].amount);
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
    const unbondingDelegations = [...unbondingResponse.unbonding_responses];
    nextKey = unbondingResponse?.pagination?.next_key;
    // Get additional data if have nextKey
    while (!!nextKey) {
      const unbondingParam = `cosmos/staking/v1beta1/delegators/${address}/unbonding_delegations?pagination.key=${nextKey}`;
      const unbondingResponse = await this.serviceUtil.getDataAPI(
        this.api,
        unbondingParam,
        ctx,
      );
      nextKey = unbondingResponse?.pagination?.next_key;
      unbondingDelegations.push(...unbondingResponse.unbonding_responses);
    }

    if (unbondingDelegations.length > 0) {
      accountOutput.unbonding_delegations = [];
      unbondingDelegations?.forEach((item) => {
        item.entries?.forEach((item1) => {
          const validator_address = item.validator_address;
          const validator = validatorData.filter(
            (e) => e.operator_address === validator_address,
          );
          const unbonding = new AccountUnbonding();

          if (validator.length > 0) {
            unbonding.validator_name = validator[0].description?.moniker;
            unbonding.validator_address = validator_address;
            unbonding.validator_identity = validator[0].description?.identity;
            unbonding.image_url = validator[0].image_url;
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
    const redelegations = [...redelegationsResponse.redelegation_responses];
    nextKey = redelegationsResponse?.pagination?.next_key;
    // Get additional data if have nextKey
    while (!!nextKey) {
      const redelegationsParam = `cosmos/staking/v1beta1/delegators/${address}/redelegations?pagination.key=${nextKey}`;
      const redelegationsResponse = await this.serviceUtil.getDataAPI(
        this.api,
        redelegationsParam,
        ctx,
      );
      nextKey = redelegationsResponse?.pagination?.next_key;
      redelegations.push(...redelegationsResponse.redelegation_responses);
    }

    if (redelegations.length > 0) {
      accountOutput.redelegations = [];
      redelegations.forEach((item) => {
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
            redelegation.validator_src_name =
              validatorSrc[0].description?.moniker;
            redelegation.validator_src_address = validator_src_address;
            redelegation.validator_src_identity =
              validatorSrc[0].description?.identity;
            redelegation.validator_src_jailed = Number(validatorSrc[0].jailed);
            redelegation.image_src_url = validatorSrc[0].image_url;
          }
          if (validatorDst.length > 0) {
            redelegation.validator_dst_name =
              validatorDst[0].description?.moniker;
            redelegation.validator_dst_address = validator_dst_address;
            redelegation.validator_dst_identity =
              validatorDst[0].description?.identity;
            redelegation.validator_dst_jailed = Number(validatorDst[0].jailed);
            redelegation.image_dst_url = validatorDst[0].image_url;
          }
          redelegation.amount = this.changeUauraToAura(item1.balance);
          redelegation.completion_time =
            item1.redelegation_entry.completion_time;

          accountOutput.redelegations.push(redelegation);
        });
      });
    }

    // get validator by delegation address
    const validator = validatorData.filter(
      (e) => e.account_address === address,
    );
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
        commissionData.commission?.commission?.length > 0 &&
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
    if (accountResponse?.account) {
      const account = accountResponse?.account;
      const baseVesting = account.base_vesting_account;
      if (baseVesting !== undefined) {
        const vesting = new AccountVesting();
        vesting.type = String(account['@type']);
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
