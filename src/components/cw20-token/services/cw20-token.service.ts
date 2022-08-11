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
import { Cw20TokenByOwnerParamsDto } from "../dtos/cw20-token-by-owner-params.dto";

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

    async getCw20TokensByOwner(ctx: RequestContext, request: Cw20TokenByOwnerParamsDto): Promise<any> {
        this.logger.log(ctx, `${this.getCw20TokensByOwner.name} was called!`);
        const result = await this.tokenContractRepository.getCw20TokensByOwner(request);

        return { tokens: result[0], count: result[1][0].total };
    }
}