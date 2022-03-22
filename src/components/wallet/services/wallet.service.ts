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
        this.logger.setContext(WalletService.name);
    }

    async getWalletDetailByAddress(ctx: RequestContext, address): Promise<any> {
        this.logger.log(ctx, `${this.getWalletDetailByAddress.name} was called!`);

        const api = this.configService.get<string>('node.api');
    
        const walletOutput = new WalletOutput();
        walletOutput.address = address;
        //get balance
        const paramsBalance = `/cosmos/bank/v1beta1/balances/${address}`;
        const balanceData = await this.getDataAPI(api, paramsBalance);
        if (balanceData) {
            walletOutput.balance = balanceData;
        }
        //get delegated
        const paramsDelegated = `/cosmos/staking/v1beta1/delegations/${address}`;
        const delegatedData = await this.getDataAPI(api, paramsDelegated);
        if (delegatedData) {
            walletOutput.delegated = delegatedData;
        }
        //get unbonding
        const paramsUnbonding = `/cosmos/staking/v1beta1/delegators/${address}/unbonding_delegations`;
        const unbondingData = await this.getDataAPI(api, paramsUnbonding);
        if (unbondingData) {
            walletOutput.unbonding = unbondingData;
        }
        //get stake_reward
        const paramsStakeReward = `/cosmos/distribution/v1beta1/delegators/${address}/rewards`;
        const stakeRewardData = await this.getDataAPI(api, paramsStakeReward);
        if (stakeRewardData) {
            walletOutput.stake_reward = stakeRewardData;
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