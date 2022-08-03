import { Injectable } from "@nestjs/common";
import { TokenContractRepository } from "../../../components/contract/repositories/token-contract.repository";
import { AkcLogger, CONTRACT_TYPE, RequestContext } from "../../../shared";
import { Cw721TokenParamsDto } from "../dtos/cw721-token-params.dto";
import { Like } from "typeorm";

@Injectable()
export class Cw721TokenService {
    constructor(
        private readonly logger: AkcLogger,
        private tokenContractRepository: TokenContractRepository,
    ) {
        this.logger.setContext(Cw721TokenService.name);
    }

    async getCw721Tokens(ctx: RequestContext, request: Cw721TokenParamsDto): Promise<any> {
        this.logger.log(ctx, `${this.getCw721Tokens.name} was called!`);
        const [tokens, count] = await this.tokenContractRepository.findAndCount({
            where: [
                {
                    type: CONTRACT_TYPE.CW721,
                    ...(request?.keyword && { contract_address: Like(`%${request.keyword}%`) })
                },
                {
                    type: CONTRACT_TYPE.CW721,
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
                type: CONTRACT_TYPE.CW721,
                contract_address: contractAddress
            },
        });

        return token ? token : null;
    }
}