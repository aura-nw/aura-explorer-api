import { HttpService } from "@nestjs/axios";
import { Injectable } from "@nestjs/common";;
import { lastValueFrom } from "rxjs";
import { Like, Not } from "typeorm";
import { AkcLogger, CONTRACT_CODE_RESULT, ERROR_MAP, INDEXER_API, RequestContext } from "../../../shared";
import * as appConfig from '../../../shared/configs/configuration';
import { MappingDataHelper } from "../../../shared/helpers/mapping-data.helper";
import { ServiceUtil } from "../../../shared/utils/service.util";
import { ContractCodeParamsDto } from "../dtos/contract-code-params.dto";
import { RegisterContractCodeParamsDto } from "../dtos/register-contract-code-params.dto";
import { UpdateContractCodeParamsDto } from "../dtos/update-contract-code-params.dto";
import { SmartContractCodeRepository } from "../repositories/smart-contract-code.repository";

@Injectable()
export class ContractCodeService {
    private api;
    private indexerUrl;
    private indexerChainId;

    constructor(
        private readonly logger: AkcLogger,
        private smartContractCodeRepository: SmartContractCodeRepository,
        private serviceUtil: ServiceUtil,
        private httpService: HttpService
    ) {
        this.logger.setContext(ContractCodeService.name);
        const appParams = appConfig.default();
        this.api = appParams.node.api;
        this.indexerUrl = appParams.indexer.url;
        this.indexerChainId = appParams.indexer.chainId;
    }

    async getContractCodes(ctx: RequestContext, request: ContractCodeParamsDto): Promise<any> {
        this.logger.log(ctx, `${this.getContractCodes.name} was called!`);
        const [contract_codes, count] = await this.smartContractCodeRepository.findAndCount({
            where: {
                creator: request.account_address,
                type: Not(''),
                ...(request?.keyword && { code_id: Like(`%${request.keyword}%`) })
            },
            order: { updated_at: 'DESC' },
            take: request.limit,
            skip: request.offset
        });

        return { contract_codes: contract_codes, count };
    }

    async registerContractCode(ctx: RequestContext, request: RegisterContractCodeParamsDto): Promise<any> {
        //check exist code id in db
        let contractCodeDb = await this.smartContractCodeRepository.findOne({
            where: { code_id: request.code_id }
        });
        if (contractCodeDb) {
            if (contractCodeDb.type !== '') {
                return {
                    Code: ERROR_MAP.CONTRACT_CODE_ID_EXIST.Code,
                    Message: ERROR_MAP.CONTRACT_CODE_ID_EXIST.Message
                };
            }
            //register in indexer
            const properties = {
                codeId: request.code_id,
                contractType: request.type,
                chainId: this.indexerChainId

            }
            await lastValueFrom(this.httpService.post(`${this.indexerUrl}${INDEXER_API.REGISTER_CODE_ID}`, properties)).then(
                (rs) => rs.data,
            );
            contractCodeDb = MappingDataHelper.mappingContractCode(
                contractCodeDb,
                request.type,
                CONTRACT_CODE_RESULT.TBD
            );
            return await this.smartContractCodeRepository.save(contractCodeDb);
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
        this.logger.log(ctx, `${this.updateContractCode.name} was called! ${codeId} ${request.type} ${this.indexerChainId}`);
        try {
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
                        codeId: Number(codeId),
                        contractType: request.type,
                        chainId: this.indexerChainId

                    }
                    this.logger.log(ctx, `Call Indexer with parameter indexer: ${properties}`)
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
        } catch (err) {
            this.logger.error(ctx, `Class ${ContractCodeService.name} call updateContractCode method error: ${err.stack}`);
            throw err;
        }
    }
}