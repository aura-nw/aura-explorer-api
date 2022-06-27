import { Injectable } from "@nestjs/common";
import { Like } from "typeorm";
import { AkcLogger, RequestContext } from "../../../shared";
import { ContractCodeParamsDto } from "../dtos/contract-code-params.dto";
import { ContractCodeRepository } from "../repositories/contract-code.repository";

@Injectable()
export class ContractCodeService {
    constructor(
        private readonly logger: AkcLogger,
        private contractCodeRepository: ContractCodeRepository
    ) {
        this.logger.setContext(ContractCodeService.name);
    }

    async getContractCodes(ctx: RequestContext, request: ContractCodeParamsDto): Promise<any> {
        this.logger.log(ctx, `${this.getContractCodes.name} was called!`);
        const [contract_codes, count] = await this.contractCodeRepository.findAndCount({
            where: {
                ...(request?.keyword && { code_id: Like(`%${request.keyword}%`) })
            },
            order: { updated_at: 'DESC' },
            take: request.limit,
            skip: request.offset
        });

        return { contract_codes: contract_codes, count };
    }
}