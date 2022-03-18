import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AkcLogger, RequestContext } from "../../../shared";
import { WalletOutput } from "../dtos/wallet-output.dto";
import { lastValueFrom } from 'rxjs';
import { HttpService } from "@nestjs/axios";

@Injectable()
export class WalletService {
    constructor(
        private readonly logger: AkcLogger,
        private configService: ConfigService,
        private httpService: HttpService,
    ) {
        
    }

    async getWalletDetailByAddress(ctx: RequestContext, address): Promise<any> {
        this.logger.log(ctx, `${this.getWalletDetailByAddress.name} was called!`);

        const api = this.configService.get<string>('node.api');
    
        const walletOutput = new WalletOutput();
        walletOutput.address = address;
        //get balance
        const paramsBalance = `/cosmos/bank/v1beta1/balances/${address}`;
        const balanceData = await this.getDataAPI(api, paramsBalance);
        if (balanceData && balanceData.balances && balanceData.balances.length > 0) {
            walletOutput.balance = balanceData.balances[0].amount;
        }
        //get delegated
        const paramsDelegated = `/cosmos/staking/v1beta1/delegations/${address}`;
        const delegatedData = await this.getDataAPI(api, paramsDelegated);
        if (delegatedData && delegatedData.delegation_responses && delegatedData.delegation_responses.length > 0) {
            walletOutput.delegated = delegatedData.delegation_responses[0].balance.amount;
        }
        //get unbonding
        const paramsUnbonding = `/cosmos/staking/v1beta1/delegators/${address}/unbonding_delegations`;
        const unbondingData = await this.getDataAPI(api, paramsUnbonding);
        if (unbondingData && unbondingData.unbonding_responses && unbondingData.unbonding_responses.length > 0 && unbondingData.unbonding_responses[0].entries.length > 0) {
            walletOutput.unbonding = unbondingData.unbonding_responses[0].entries[0].balance;
        }
        //get stake_reward
        const paramsStakeReward = `/cosmos/distribution/v1beta1/delegators/${address}/rewards`;
        const stakeRewardData = await this.getDataAPI(api, paramsStakeReward);
        if (stakeRewardData && stakeRewardData.rewards && stakeRewardData.rewards.length > 0 && stakeRewardData.rewards[0].reward.length > 0) {
            walletOutput.stake_reward = stakeRewardData.rewards[0].reward[0].amount;
        }
    
        return { ...walletOutput };
    }

    async getDataAPI(api, params) {
        const data = await lastValueFrom(this.httpService.get(api + params)).then(
          (rs) => rs.data,
        );
    
        return data;
    }
}