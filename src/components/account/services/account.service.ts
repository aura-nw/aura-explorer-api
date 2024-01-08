import { Injectable } from '@nestjs/common';
import { ServiceUtil } from '../../../shared/utils/service.util';
import { AkcLogger, INDEXER_API_V2, RequestContext } from '../../../shared';
import * as appConfig from '../../../shared/configs/configuration';

@Injectable()
export class AccountService {
  private api;
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
    this.precisionDiv = appParams.chainInfo.precisionDiv;
    this.decimals = appParams.chainInfo.coinDecimals;
    this.chainDB = appParams.indexerV2.chainDB;
  }

  async getTotalBalanceByAddress(
    ctx: RequestContext,
    listAddress: string[],
  ): Promise<any> {
    this.logger.log(ctx, `${this.getTotalBalanceByAddress.name} was called!`);

    const graphqlQueryAcc = {
      query: INDEXER_API_V2.GRAPH_QL.LIST_ACCOUNT,
      variables: {
        listAddress: listAddress,
      },
      operationName: INDEXER_API_V2.OPERATION_NAME.LIST_ACCOUNT,
    };

    const graphqlQueryVal = {
      query: INDEXER_API_V2.GRAPH_QL.LIST_VALIDATOR,
      variables: {
        listAddress: listAddress,
      },
      operationName: INDEXER_API_V2.OPERATION_NAME.LIST_VALIDATOR,
    };
    const [account, validators] = await Promise.all([
      this.serviceUtil.fetchDataFromGraphQL(graphqlQueryAcc),
      this.serviceUtil.fetchDataFromGraphQL(graphqlQueryVal),
    ]);

    const accountData = account?.data[this.chainDB]['account'];
    const validatorData = validators?.data[this.chainDB]['validator'];

    const totalBalance = await Promise.all(
      accountData?.map(async (data) => {
        const delegationsParam = `cosmos/staking/v1beta1/delegations/${data.address}`;
        const unbondingParam = `cosmos/staking/v1beta1/delegators/${data.address}/unbonding_delegations`;
        const [delegationsResponse, unbondingResponse] = await Promise.all([
          this.serviceUtil.getDataAPI(this.api, delegationsParam, ctx),
          this.serviceUtil.getDataAPI(this.api, unbondingParam, ctx),
        ]);
        // get balance
        let balancesAmount = 0;
        const balances = data.balances?.length ? data.balances : [];
        balances.forEach((item) => {
          if (item.denom === this.minimalDenom) {
            balancesAmount = parseFloat(item.amount);
          }
        });

        // Get available
        let available = 0;
        if (data?.spendable_balances) {
          const spendable_balances = data.spendable_balances?.length
            ? data.spendable_balances
            : [];
          const uaura = spendable_balances?.find(
            (f) => f.denom === this.minimalDenom,
          );
          if (uaura) {
            const amount = uaura.amount;
            available = parseFloat(amount);
          }
        }

        // Get delegate
        let delegatedAmount = 0;
        let stakeReward = 0;
        const accountDelegations = [
          ...delegationsResponse.delegation_responses,
        ];
        let nextKey = delegationsResponse?.pagination?.next_key;
        // Get additional data if have nextKey
        while (!!nextKey) {
          const delegationsParam = `cosmos/staking/v1beta1/delegations/${data.address}?pagination.key=${nextKey}`;
          const delegationsResponse = await this.serviceUtil.getDataAPI(
            this.api,
            delegationsParam,
            ctx,
          );
          nextKey = delegationsResponse?.pagination?.next_key;
          accountDelegations.push(...delegationsResponse.delegation_responses);
        }

        if (accountDelegations.length > 0) {
          const delegateRewardParam = `cosmos/distribution/v1beta1/delegators/${data.address}/rewards`;
          const delegationsRewardRespone = await this.serviceUtil.getDataAPI(
            this.api,
            delegateRewardParam,
            ctx,
          );
          accountDelegations.forEach((item) => {
            delegatedAmount += parseInt(item.balance.amount);
            if (
              delegationsRewardRespone &&
              delegationsRewardRespone.total &&
              delegationsRewardRespone.total.length > 0 &&
              delegationsRewardRespone.total[0].denom === this.minimalDenom
            ) {
              stakeReward = parseInt(delegationsRewardRespone?.total[0].amount);
            }
          });
        }

        // get unbonding
        let unbondingAmount = 0;
        const unbondingDelegations = [...unbondingResponse.unbonding_responses];
        nextKey = unbondingResponse?.pagination?.next_key;
        // Get additional data if have nextKey
        while (!!nextKey) {
          const unbondingParam = `cosmos/staking/v1beta1/delegators/${data.address}/unbonding_delegations?pagination.key=${nextKey}`;
          const unbondingResponse = await this.serviceUtil.getDataAPI(
            this.api,
            unbondingParam,
            ctx,
          );
          nextKey = unbondingResponse?.pagination?.next_key;
          unbondingDelegations.push(...unbondingResponse.unbonding_responses);
        }

        if (unbondingDelegations.length > 0) {
          unbondingDelegations?.forEach((item) => {
            item.entries?.forEach((item1) => {
              unbondingAmount += parseInt(item1.balance);
            });
          });
        }

        // get validator by delegation address
        const validator = validatorData.filter(
          (e) => e.account_address === data.address,
        );
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
          }
        }
        //get auth_info
        let delegatedVesting = 0;
        if (balancesAmount > 0) {
          delegatedVesting = balancesAmount - available;
        }
        // get total
        const total =
          available +
          delegatedAmount +
          unbondingAmount +
          stakeReward +
          parseFloat(commission) +
          delegatedVesting;

        return { address: data.address, amount: total };
      }),
    );

    return totalBalance;
  }

  changeUauraToAura(amount) {
    return (amount / this.precisionDiv).toFixed(this.decimals);
  }
}
