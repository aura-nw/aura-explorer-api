import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ServiceUtil } from "../../../shared/utils/service.util";
import { Like } from "typeorm";
import { AkcLogger, CONTRACT_CODE_RESULT, ERROR_MAP, INDEXER_API, RequestContext } from "../../../shared";
import { ContractCodeParamsDto } from "../dtos/contract-code-params.dto";
import { RegisterContractCodeParamsDto } from "../dtos/register-contract-code-params.dto";
import { SmartContractCodeRepository } from "../repositories/smart-contract-code.repository";
import { SmartContractCode } from "../../../shared/entities/smart-contract-code.entity";
import { UpdateContractCodeParamsDto } from "../dtos/update-contract-code-params.dto";
import { lastValueFrom } from "rxjs";
import { HttpService } from "@nestjs/axios";
import { MappingDataHelper } from "../../../shared/helpers/mapping-data.helper";
import * as appConfig from '../../../shared/configs/configuration';

@Injectable()
export class ContractCodeService {
    private api;
    private indexerUrl;

    constructor(
        private readonly logger: AkcLogger,
        private smartContractCodeRepository: SmartContractCodeRepository,
        private configService: ConfigService,
        private serviceUtil: ServiceUtil,
        private httpService: HttpService
    ) {
        this.logger.setContext(ContractCodeService.name);
        const appParams = appConfig.default();
        this.api = appParams.node.api;
        this.indexerUrl = appParams.indexer.url;
    }

    async getContractCodes(ctx: RequestContext, request: ContractCodeParamsDto): Promise<any> {
        this.logger.log(ctx, `${this.getContractCodes.name} was called!`);
        const [contract_codes, count] = await this.smartContractCodeRepository.findAndCount({
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
            const contractCodeDb = await this.smartContractCodeRepository.findOne({
                where: { code_id: request.code_id }
            });
            if (contractCodeDb) {
                return {
                    Code: ERROR_MAP.CONTRACT_CODE_ID_EXIST.Code,
                    Message: ERROR_MAP.CONTRACT_CODE_ID_EXIST.Message
                };
            }
            //check creator
            if (contractCodeNode.code_info.creator !== request.account_address) {
                return {
                    Code: ERROR_MAP.NOT_CONTRACT_CREATOR.Code,
                    Message: ERROR_MAP.NOT_CONTRACT_CREATOR.Message
                };
            }
            //register in indexerp
            const properties = {
                code_id: request.code_id

            }
            await lastValueFrom(this.httpService.post(`${this.indexerUrl}${INDEXER_API.REGISTER_CODE_ID}`, properties)).then(
                (rs) => rs.data,
            );
            const contractCode = MappingDataHelper.mappingContractCode(
                request.code_id,
                CONTRACT_CODE_RESULT.TBD,
                contractCodeNode.code_info.creator
            );
            contractCode.type = request.type;

            return await this.smartContractCodeRepository.save(contractCode);
        } else {
            return {
                Code: ERROR_MAP.CONTRACT_CODE_ID_NOT_EXIST.Code,
                Message: ERROR_MAP.CONTRACT_CODE_ID_NOT_EXIST.Message
            };
        }
    }

    async getContractCodeByCodeId(ctx: RequestContext, codeId: number): Promise<any> {
        this.logger.log(ctx, `${this.getContractCodeByCodeId.name} was called!`);

        const contractCode = await this.smartContractCodeRepository.findOne({
            where: { code_id: codeId },
        });
        return contractCode ? contractCode : null;
    }

    async updateContractCode(ctx: RequestContext, codeId: number, request: UpdateContractCodeParamsDto): Promise<any> {
        this.logger.log(ctx, `${this.updateContractCode.name} was called!`);
        //check exist code id in db
        const contractCode = await this.smartContractCodeRepository.findOne({
            where: { code_id: codeId },
        });
        if (contractCode) {
            //check result
            const result = contractCode.result;
            if (result !== CONTRACT_CODE_RESULT.CORRECT) {
                //register in indexer
                const properties = {
                    code_id: codeId

                }
                await lastValueFrom(this.httpService.post(`${this.indexerUrl}${INDEXER_API.REGISTER_CODE_ID}`, properties)).then(
                    (rs) => rs.data,
                );
                contractCode.type = request.type;
                contractCode.result = CONTRACT_CODE_RESULT.TBD;
                return this.smartContractCodeRepository.save(contractCode);
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