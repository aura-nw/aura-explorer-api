import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ServiceUtil } from "../../../shared/utils/service.util";
import { Like } from "typeorm";
import { AkcLogger, CONTRACT_CODE_RESULT, ERROR_MAP, RequestContext } from "../../../shared";
import { ContractCodeParamsDto } from "../dtos/contract-code-params.dto";
import { RegisterContractCodeParamsDto } from "../dtos/register-contract-code-params.dto";
import { ContractCodeRepository } from "../repositories/contract-code.repository";
import { SmartContractCode } from "../../../shared/entities/smart-contract-code.entity";
import { UpdateContractCodeParamsDto } from "../dtos/update-contract-code-params.dto";

@Injectable()
export class ContractCodeService {
    private api;

    constructor(
        private readonly logger: AkcLogger,
        private contractCodeRepository: ContractCodeRepository,
        private configService: ConfigService,
        private serviceUtil: ServiceUtil
    ) {
        this.logger.setContext(ContractCodeService.name);
        this.api = this.configService.get('API');
    }

    async getContractCodes(ctx: RequestContext, request: ContractCodeParamsDto): Promise<any> {
        this.logger.log(ctx, `${this.getContractCodes.name} was called!`);
        const [contract_codes, count] = await this.contractCodeRepository.findAndCount({
            where: {
                creator: request.account_address,
                ...(request?.keyword && { code_id: Like(`%${request.keyword}%`) })
            },
            order: { updated_at: 'DESC' },
            take: request.limit,
            skip: request.offset
        });

        return { contract_codes: contract_codes, count };
    }

    async registerContractCode(ctx: RequestContext, request: RegisterContractCodeParamsDto): Promise<any> {
        //check exist code id in node
        const contractCodeParams = `cosmwasm/wasm/v1/code/${request.code_id}`;
        const contractCodeNode = await this.serviceUtil.getDataAPI(this.api, contractCodeParams, ctx);
        if (contractCodeNode && contractCodeNode?.code_info) {
            //check exist code id in db
            const contractCodeDb = await this.contractCodeRepository.findOne({
                where: { code_id: request.code_id }
            });
            if (contractCodeDb) {
                return {
                    Code: ERROR_MAP.CONTRACT_CODE_ID_EXIST.Code,
                    Message: ERROR_MAP.CONTRACT_CODE_ID_EXIST.Message
                };
            }
            //check creator
            if (contractCodeNode.code_info.creator != request.account_address) {
                return {
                    Code: ERROR_MAP.NOT_CONTRACT_CREATOR.Code,
                    Message: ERROR_MAP.NOT_CONTRACT_CREATOR.Message
                };
            }
            let contractCode = new SmartContractCode();
            contractCode.code_id = request.code_id;
            contractCode.type = request.type;
            contractCode.result = CONTRACT_CODE_RESULT.TBD;
            contractCode.creator = contractCodeNode.code_info.creator;
            return await this.contractCodeRepository.save(contractCode);
        } else {
            return {
                Code: ERROR_MAP.CONTRACT_CODE_ID_NOT_EXIST.Code,
                Message: ERROR_MAP.CONTRACT_CODE_ID_NOT_EXIST.Message
            };
        }
    }

    async getContractCodeByCodeId(ctx: RequestContext, codeId: number): Promise<any> {
        this.logger.log(ctx, `${this.getContractCodeByCodeId.name} was called!`);
        
        const contractCode = await this.contractCodeRepository.findOne({
            where: { code_id: codeId },
        });
        return contractCode ? contractCode : null;
    }

    async updateContractCode(ctx: RequestContext, codeId: number, request: UpdateContractCodeParamsDto): Promise<any> {
        this.logger.log(ctx, `${this.updateContractCode.name} was called!`);
        //check exist code id in db
        const contractCode = await this.contractCodeRepository.findOne({
            where: { code_id: codeId },
        });
        if (contractCode) {
            //check result
            const result = contractCode.result;
            if (result !== CONTRACT_CODE_RESULT.CORRECT) {
                contractCode.type = request.type;
                contractCode.result = CONTRACT_CODE_RESULT.TBD;
                return this.contractCodeRepository.save(contractCode);
            } else {
                return {
                    Code: ERROR_MAP.CANNOT_UPDATE_CONTRACT_CODE.Code,
                    Message: ERROR_MAP.CANNOT_UPDATE_CONTRACT_CODE.Message
                };
            }
        } else {
            return {
                Code: ERROR_MAP.CONTRACT_CODE_ID_NOT_EXIST.Code,
                Message: ERROR_MAP.CONTRACT_CODE_ID_NOT_EXIST.Message
            };
        }
    }
}