import { Injectable } from "@nestjs/common";
import { AkcLogger, CONTRACT_TYPE, INDEXER_API, RequestContext } from "../../../shared";
import { Cw20TokenParamsDto } from "../dtos/cw20-token-params.dto";
import { TokenContractRepository } from "../../../components/contract/repositories/token-contract.repository";
import { Like } from "typeorm";
import { TokenTransactionParamsDto } from "../dtos/token-transaction-params.dto";
import * as appConfig from '../../../shared/configs/configuration';
import * as util from 'util';
import { ServiceUtil } from "../../../shared/utils/service.util";
import { SmartContractRepository } from "../../../components/contract/repositories/smart-contract.repository";

@Injectable()
export class Cw20TokenService {
    private appParams;
    private indexerUrl;
    private indexerChainId;

    constructor(
        private readonly logger: AkcLogger,
        private tokenContractRepository: TokenContractRepository,
        private smartContractRepository: SmartContractRepository,
        private serviceUtil: ServiceUtil
    ) {
        this.logger.setContext(Cw20TokenService.name);
        this.appParams = appConfig.default();
        this.indexerUrl = this.appParams.indexer.url;
        this.indexerChainId = this.appParams.indexer.chainId;
    }

    async getCw20Tokens(ctx: RequestContext, request: Cw20TokenParamsDto): Promise<any> {
        this.logger.log(ctx, `${this.getCw20Tokens.name} was called!`);
        const [tokens, count] = await this.tokenContractRepository.findAndCount({
            where: [
                {
                    type: CONTRACT_TYPE.CW20,
                    ...(request?.keyword && { contract_address: Like(`%${request.keyword}%`) })
                },
                {
                    type: CONTRACT_TYPE.CW20,
                    ...(request?.keyword && { name: Like(`%${request.keyword}%`) })
                }
            ],
            order: { updated_at: 'DESC' },
            take: request.limit,
            skip: request.offset
        });

        return { tokens: tokens, count: count };
    }

    async getTokenByContractAddress(ctx: RequestContext, contractAddress: string): Promise<any> {
        this.logger.log(ctx, `${this.getTokenByContractAddress.name} was called!`);
        const token = await this.tokenContractRepository.findOne({
            where: {
                contract_address: contractAddress
            },
        });

        return token ? token : null;
    }

    async getListTokenTransactions(ctx: RequestContext, request: TokenTransactionParamsDto): Promise<any> {
        this.logger.log(ctx, `${this.getListTokenTransactions.name} was called!`);
        const result = await this.tokenContractRepository.getListTokenTransactions(request);

        return { transactions: result[0], count: result[1][0].total };
    }

    async getTokensByOwner(ctx: RequestContext, accountAddress: string): Promise<any> {
        this.logger.log(ctx, `${this.getTokensByOwner.name} was called!`);
        const tokens = await this.serviceUtil.getDataAPI(`${this.indexerUrl}${util.format(INDEXER_API.GET_TOKENS_BY_OWNER, accountAddress, this.indexerChainId)}`, '', ctx);
        const cw20Tokens = tokens.data.assets.CW20.asset;
        const cw721Tokens = tokens.data.assets.CW721.asset;
        if (cw20Tokens.length > 0) {
            for (let i = 0; i < cw20Tokens.length; i++) {
                const item = cw20Tokens[i];
                const token = await this.tokenContractRepository.findOne({
                    where: {
                        contract_address: item.contract_address
                    },
                });
                item.image = token ? token.image : '';
            }
        }
        if (cw721Tokens.length > 0) {
            for (let i = 0; i < cw721Tokens.length; i++) {
                const item = cw721Tokens[i];
                const contract = await this.smartContractRepository.findOne({
                    where: {
                        contract_address: item.contract_address
                    },
                });
                item.name = contract ? contract.contract_name : '';
            }
        }

        return tokens ? tokens : null;
    }
}