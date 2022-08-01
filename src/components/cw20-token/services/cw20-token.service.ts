import { Injectable } from "@nestjs/common";
import { AkcLogger, RequestContext } from "../../../shared";
import { Cw20TokenParamsDto } from "../dtos/cw20-token-params.dto";
import * as appConfig from '../../../shared/configs/configuration';
import { TokenContractRepository } from "../../../components/contract/repositories/token-contract.repository";
import { Like } from "typeorm";

@Injectable()
export class Cw20TokenService {
    private api;
    private indexerUrl;
    private indexerChainId;

    constructor(
        private readonly logger: AkcLogger,
        private tokenContractRepository: TokenContractRepository,
    ) {
        this.logger.setContext(Cw20TokenService.name);
        const appParams = appConfig.default();
        this.api = appParams.node.api;
        this.indexerUrl = appParams.indexer.url;
        this.indexerChainId = appParams.indexer.chainId;
    }

    async getCw20Tokens(ctx: RequestContext, request: Cw20TokenParamsDto): Promise<any> {
        this.logger.log(ctx, `${this.getCw20Tokens.name} was called!`);
        const [tokens, count] = await this.tokenContractRepository.findAndCount({
            where: [
                {
                    ...(request?.keyword && { contract_address: Like(`%${request.keyword}%`) })
                },
                {
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
            where: { contract_address: contractAddress },
        });

        return token ? token : null;
    }
}