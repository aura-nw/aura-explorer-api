import { Injectable } from "@nestjs/common";
import { AkcLogger, CONTRACT_TYPE, RequestContext } from "../../../shared";
import { Cw20TokenParamsDto } from "../dtos/cw20-token-params.dto";
import { TokenContractRepository } from "../../../components/contract/repositories/token-contract.repository";
import { Like } from "typeorm";
import { TokenTransactionParamsDto } from "../dtos/token-transaction-params.dto";

@Injectable()
export class Cw20TokenService {
    constructor(
        private readonly logger: AkcLogger,
        private tokenContractRepository: TokenContractRepository,
    ) {
        this.logger.setContext(Cw20TokenService.name);
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
}