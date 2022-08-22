import { Injectable } from "@nestjs/common";
import { TokenContractRepository } from "../../../components/contract/repositories/token-contract.repository";
import { AkcLogger, CONTRACT_TYPE, INDEXER_API, RequestContext, TokenContract } from "../../../shared";
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
    }

    async getCw20Tokens(ctx: RequestContext, request: Cw20TokenParamsDto): Promise<any> {
        this.logger.log(ctx, `${this.getCw20Tokens.name} was called!`);
        const [tokens, count] = await this.tokenContractRepository.getDataTokens(CONTRACT_TYPE.CW20, request?.keyword, request.limit, request.offset);
        if (tokens.length > 0) {
            for (let i = 0; i < tokens.length; i++) {
                const item = tokens[i];
                item.max_total_supply = 0;
                item.price = 0;
                item.price_change_percentage_24h = 0;
                item.volume_24h = 0;
                item.circulating_market_cap = 0;
                item.fully_diluted_market_cap = 0;
                item.holders = 0;
                item.holders_change_percentage_24h = 0;
                //get token info from coingecko
                const data = await this.redisUtil.getValue(item.coin_id);
                if (data) {
                    const priceData = JSON.parse(data);
                    item.max_total_supply = priceData.max_supply;
                    item.price = priceData.current_price;
                    item.price_change_percentage_24h = priceData.price_change_percentage_24h;
                    item.volume_24h = priceData.total_volume;
                    item.circulating_market_cap = priceData.current_price * priceData.circulating_supply;
                    item.fully_diluted_market_cap = priceData.current_price * priceData.max_supply;
                    // item.holders = 0;
                    // item.holders_change_percentage_24h = 0;
                }
            }
        }

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
            token.max_total_supply = 0;
            token.price = 0;
            token.price_change_percentage_24h = 0;
            token.circulating_market_cap = 0;
            token.fully_diluted_market_cap = 0;
            token.holders = 0;
            token.holders_change_percentage_24h = 0;
            //get token info from coingecko
            const data = await this.redisUtil.getValue(token.coin_id);
            if (data) {
                const priceData = JSON.parse(data);
                token.max_total_supply = priceData.max_supply;
                token.price = priceData.current_price;
                token.price_change_percentage_24h = priceData.price_change_percentage_24h;
                token.circulating_market_cap = priceData.current_price * priceData.circulating_supply;
                token.fully_diluted_market_cap = priceData.current_price * priceData.max_supply;
                // token.holders = 0;
                // token.holders_change_percentage_24h = 0;
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

        return { tokens: result[0], count: result[1][0].total };
    }

    async getPriceById(ctx: RequestContext, id: string): Promise<any> {
        this.logger.log(ctx, `${this.getPriceById.name} was called!`);
        let price = 0;
        this.redisUtil.connect();
        const data = await this.redisUtil.getValue(id);
        if (data) {
            const priceData = JSON.parse(data);
            price = priceData.current_price;
        }

        return price;
    }
}