import { Injectable } from "@nestjs/common";
import { TokenContractRepository } from "../../../components/contract/repositories/token-contract.repository";
import { AkcLogger, AURA_INFO, CONTRACT_TYPE, INDEXER_API, RequestContext, TokenContract } from "../../../shared";
import * as appConfig from '../../../shared/configs/configuration';
import { ServiceUtil } from "../../../shared/utils/service.util";
import { Cw20TokenByOwnerParamsDto } from "../dtos/cw20-token-by-owner-params.dto";
import { Cw20TokenParamsDto } from "../dtos/cw20-token-params.dto";
import { TokenTransactionParamsDto } from "../dtos/token-transaction-params.dto";
import * as util from 'util';
import { RedisUtil } from "../../../shared/utils/redis.util";

@Injectable()
export class Cw20TokenService {
    private appParams;
    private indexerUrl;
    private indexerChainId;
    private api;

    constructor(
        private readonly logger: AkcLogger,
        private tokenContractRepository: TokenContractRepository,
        private serviceUtil: ServiceUtil,
        private redisUtil: RedisUtil
    ) {
        this.logger.setContext(Cw20TokenService.name);
        this.appParams = appConfig.default();
        this.indexerUrl = this.appParams.indexer.url;
        this.indexerChainId = this.appParams.indexer.chainId;
        this.api = this.appParams.api;
    }

    async getCw20Tokens(ctx: RequestContext, request: Cw20TokenParamsDto): Promise<any> {
        this.logger.log(ctx, `${this.getCw20Tokens.name} was called!`);
        const [tokens, count] = await this.tokenContractRepository.getDataTokens(CONTRACT_TYPE.CW20, request?.keyword, request.limit, request.offset);

        return { tokens: tokens, count: count };
    }

    async getTokenByContractAddress(ctx: RequestContext, contractAddress: string): Promise<any> {
        this.logger.log(ctx, `${this.getTokenByContractAddress.name} was called!`);
        let token: any = null;
        const tokenData = await this.tokenContractRepository.getTokenByContractAddress(contractAddress);
        if (tokenData.length > 0) {
            token = tokenData[0];
            //get num holders
            const holdersData = await this.serviceUtil.getDataAPI(`${this.indexerUrl}${util.format(INDEXER_API.TOKEN_HOLDERS, this.indexerChainId, tokenData[0].type, contractAddress)}`, '', ctx);
            token.num_holders = 0;
            if (holdersData?.data) {
                token.num_holders = holdersData.data.resultCount;
            }
        }

        return token;
    }

    async getListTokenTransactions(ctx: RequestContext, request: TokenTransactionParamsDto): Promise<any> {
        this.logger.log(ctx, `${this.getListTokenTransactions.name} was called!`);
        const result = await this.tokenContractRepository.getListTokenTransactions(request);

        return { transactions: result[0], count: result[1][0].total };
    }

    async getCw20TokensByOwner(ctx: RequestContext, request: Cw20TokenByOwnerParamsDto): Promise<any> {
        this.logger.log(ctx, `${this.getCw20TokensByOwner.name} was called!`);
        const result = await this.tokenContractRepository.getCw20TokensByOwner(request);
        result.forEach(async (item)=>{
            if(item.contract_address === AURA_INFO.CONNTRACT_ADDRESS){
                //get balance
                item.balance = 0;
                item.value = 0;
                const balanceParams = `cosmos/bank/v1beta1/balances/${request.account_address}`;
                const balanceData = await this.serviceUtil.getDataAPI(this.api, balanceParams, ctx)
                if (balanceData && balanceData?.balances && balanceData?.balances?.length > 0) {
                    item.balance = Number(balanceData.balances[0].amount);
                    item.value = item.balance * Number(item.price);
                }
            }
        });

        return { tokens: result[0], count: result[1][0].total };
    }

    async getPriceById(ctx: RequestContext, id: string): Promise<any> {
        this.logger.log(ctx, `${this.getPriceById.name} was called!`);
        let price = 0;
        const data = await this.redisUtil.getValue(id);
        if (data) {
            const priceData = JSON.parse(data);
            price = priceData.current_price;
        }

        return price;
    }
}