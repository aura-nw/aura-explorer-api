import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AkcLogger, RequestContext } from '../../../shared';
import { WalletOutput } from '../dtos/wallet-output.dto';
import { lastValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { ServiceUtil } from '../../../shared/utils/service.util';

@Injectable()
export class WalletService {
  private api;
  constructor(
    private readonly logger: AkcLogger,
    private configService: ConfigService,
    private httpService: HttpService,
    private serviceUtil: ServiceUtil
  ) {
    this.logger.setContext(WalletService.name);
    this.api = this.configService.get('API');
  }

  async getWalletDetailByAddress(ctx: RequestContext, address): Promise<any> {
    this.logger.log(ctx, `${this.getWalletDetailByAddress.name} was called!`);

    const api = this.configService.get<string>('node.api');

    const walletOutput = new WalletOutput();
    walletOutput.address = address;
    //get balance
    const paramsBalance = `/cosmos/bank/v1beta1/balances/${address}`;
    // const balanceData = await this.getDataAPI(api, paramsBalance);
    // if (balanceData) {
    //     walletOutput.balance = balanceData;
    // }
    //get delegated
    const paramsDelegated = `/cosmos/staking/v1beta1/delegations/${address}`;
    // const delegatedData = await this.getDataAPI(api, paramsDelegated);
    // if (delegatedData) {
    //     walletOutput.delegated = delegatedData;
    // }
    //get unbonding
    const paramsUnbonding = `/cosmos/staking/v1beta1/delegators/${address}/unbonding_delegations`;
    // const unbondingData = await this.getDataAPI(api, paramsUnbonding);
    // if (unbondingData) {
    //     walletOutput.unbonding = unbondingData;
    // }
    //get stake_reward
    const paramsStakeReward = `/cosmos/distribution/v1beta1/delegators/${address}/rewards`;
    // const stakeRewardData = await this.getDataAPI(api, paramsStakeReward);
    // if (stakeRewardData) {
    //     walletOutput.stake_reward = stakeRewardData;
    // }
    //get auth_info
    const paramsAuthInfo = `auth/accounts/${address}`;
    // const authInfoData = await this.getDataAPI(api, paramsAuthInfo);
    // if (authInfoData) {
    //     walletOutput.auth_info = authInfoData;
    // }

    const [
      balanceData,
      delegatedData,
      unbondingData,
      stakeRewardData,
      authInfoData,
    ] = await Promise.all([
      this.serviceUtil.getDataAPI(this.api, paramsBalance, ctx),
      this.serviceUtil.getDataAPI(this.api, paramsDelegated, ctx),
      this.serviceUtil.getDataAPI(this.api, paramsUnbonding, ctx),
      this.serviceUtil.getDataAPI(this.api, paramsStakeReward, ctx),
      this.serviceUtil.getDataAPI(this.api, paramsAuthInfo, ctx),
    ]);
    if (balanceData) {
      walletOutput.balance = balanceData;
    }
    if (delegatedData) {
      walletOutput.delegated = delegatedData;
    }
    if (unbondingData) {
      walletOutput.unbonding = unbondingData;
    }
    if (stakeRewardData) {
      walletOutput.stake_reward = stakeRewardData;
    }
    if (authInfoData) {
      walletOutput.auth_info = authInfoData;
    }
    return { ...walletOutput };
  }
}
