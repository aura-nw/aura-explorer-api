import { Injectable } from "@nestjs/common";
import { ServiceUtil } from "../../../shared/utils/service.util";
import { Like, MoreThan, Not } from "typeorm";
import { AkcLogger, CONTRACT_CODE_RESULT, CONTRACT_STATUS, CONTRACT_TRANSACTION_LABEL, CONTRACT_TRANSACTION_TYPE, ERROR_MAP, RequestContext } from "../../../shared";
import { ContractParamsDto } from "../dtos/contract-params.dto";
import { SmartContractRepository } from "../repositories/smart-contract.repository";
import { ConfigService } from "@nestjs/config";
import { TagRepository } from "../repositories/tag.repository";
import { VerifyContractParamsDto } from "../dtos/verify-contract-params.dto";
import { HttpService } from "@nestjs/axios";
import { lastValueFrom } from "rxjs";
import { SearchTransactionParamsDto } from "../dtos/search-transaction-params.dto";
import { TransactionRepository } from "../../../components/transaction/repositories/transaction.repository";
import { ContractStatusOutputDto } from "../dtos/contract-status-output.dto";
import { plainToClass } from "class-transformer";
import { ContractByCreatorOutputDto } from "../dtos/contract-by-creator-output.dto";
import { SmartContractCodeRepository } from "../../../components/contract-code/repositories/smart-contract-code.repository";

@Injectable()
export class ContractService {
  private api;
  private rpc;
  private verifyContractUrl;
  private verifyContractStatusUrl;

  constructor(
    private readonly logger: AkcLogger,
    private smartContractRepository: SmartContractRepository,
    private tagRepository: TagRepository,
    private transactionRepository: TransactionRepository,
    private smartContractCodeRepository: SmartContractCodeRepository,
    private serviceUtil: ServiceUtil,
    private configService: ConfigService,
    private httpService: HttpService
  ) {
    this.logger.setContext(ContractService.name);
    this.api = this.configService.get('API');
    this.rpc = this.configService.get('RPC');
    this.verifyContractUrl = this.configService.get('VERIFY_CONTRACT_URL');
    this.verifyContractStatusUrl = this.configService.get('VERIFY_CONTRACT_STATUS_URL');
  }

  async getContracts(ctx: RequestContext, request: ContractParamsDto): Promise<any> {
    this.logger.log(ctx, `${this.getContracts.name} was called!`);
    const result = await this.smartContractRepository.getContracts(request);

    return { contracts: result[0], count: result[1][0].total };
  }

  async getContractByAddress(ctx: RequestContext, contractAddress: string): Promise<any> {
    this.logger.log(ctx, `${this.getContractByAddress.name} was called!`);
    let contract: any = null;
    const contractData = await this.smartContractRepository.findOne({
      where: { contract_address: contractAddress },
    });
    if (contractData) {
      contract = contractData;
      const codeId = contractData.code_id;
      const balanceParams = `cosmos/bank/v1beta1/balances/${contractAddress}`;
      const [
        balanceData
      ] = await Promise.all([
        this.serviceUtil.getDataAPI(this.api, balanceParams, ctx)
      ]);
      contract.balance = 0;
      if (balanceData && balanceData?.balances && balanceData?.balances?.length > 0) {
        contract.balance = Number(balanceData.balances[0].amount);
      }
      const contractCode = await this.smartContractCodeRepository.findOne({
        where: {
          code_id: codeId
        }
      });
      contract.type = contractCode ? contractCode.type : '';
    }
    return contract;
  }

  async getTagByAddress(ctx: RequestContext, accountAddress: string, contractAddress: string): Promise<any> {
    this.logger.log(ctx, `${this.getTagByAddress.name} was called!`);
    const tag = this.tagRepository.findOne({
      where: { account_address: accountAddress, contract_address: contractAddress }
    });

    return tag;
  }

  async verifyContract(ctx: RequestContext, request: VerifyContractParamsDto): Promise<any> {
    this.logger.log(ctx, `${this.verifyContract.name} was called!`);
    const contract = await this.smartContractRepository.findOne({
      where: { contract_address: request.contract_address }
    });
    if (!contract || (contract && contract.contract_verification !== CONTRACT_STATUS.UNVERIFIED)) {
      const error = {
        Code: ERROR_MAP.CONTRACT_VERIFIED.Code,
        Message: ERROR_MAP.CONTRACT_VERIFIED.Message
      };
      return error;
    }
    const properties = {
      commit: request.commit,
      compilerVersion: request.compiler_version,
      contractAddress: request.contract_address,
      contractUrl: request.url,
      wasmFile: request.wasm_file

    }
    const result = await lastValueFrom(this.httpService.post(this.verifyContractUrl, properties)).then(
      (rs) => rs.data,
    );

    return result;
  }

  async getContractsMatchCreationCode(ctx: RequestContext, contractAddress: string): Promise<any> {
    this.logger.log(ctx, `${this.getContractsMatchCreationCode.name} was called!`);
    const contract = await this.smartContractRepository.findOne({
      where: { contract_address: contractAddress }
    });
    let contracts = [];
    let count = 0;
    if (contract) {
      const contractHash = contract.contract_hash;
      [contracts, count] = await this.smartContractRepository.findAndCount({
        where: {
          contract_address: Not(contractAddress),
          contract_hash: contractHash
        },
        order: { updated_at: 'DESC' }
      });
    }

    return { contracts: contracts, count };
  }

  async searchTransactions(ctx: RequestContext, request: SearchTransactionParamsDto): Promise<any> {
    this.logger.log(ctx, `${this.searchTransactions.name} was called!`);
    if (request?.label && !(<any>Object).values(CONTRACT_TRANSACTION_LABEL).includes(request.label)) {
      return { transactions: [], count: 0 };
    }
    const result = await this.transactionRepository.searchContractTransactions(request);

    return { transactions: result[0], count: result[1][0].total };
  }

  async verifyContractStatus(ctx: RequestContext, contractAddress: string): Promise<any> {
    this.logger.log(ctx, `${this.verifyContractStatus.name} was called!`);
    const contract = await this.smartContractRepository.findOne({
      where: { contract_address: contractAddress }
    });
    if (contract) {
      const result = await lastValueFrom(this.httpService.get(this.verifyContractStatusUrl + contractAddress)).then(
        (rs) => rs.data,
      );

      return result;
    } else {
      const error = {
        Code: ERROR_MAP.CONTRACT_NOT_EXIST.Code,
        Message: ERROR_MAP.CONTRACT_NOT_EXIST.Message
      };
      return error;
    }
  }

  /**
   * Get list status of smart contract
   * @returns List status(Array<ContractStatusOutputDto>)
   */
  getSmartContractStatus() {
    this.logger.log(null, `${this.getSmartContractStatus.name} was called!`);
    try {
      const smartContractStatus: Array<ContractStatusOutputDto> = [];
      Object.keys(CONTRACT_STATUS).forEach(key => {
        const status: ContractStatusOutputDto = new ContractStatusOutputDto();
        status.key = key;
        status.label = CONTRACT_STATUS[key];

        smartContractStatus.push(status);
      });
      return smartContractStatus;
    } catch (err) {
      this.logger.error(null, `Class ${ContractService.name} call ${this.getSmartContractStatus.name} method error: ${err.stack}`);
      throw err;
    }
  }

  /**
     * Get list code id
     * @param creatorAddress: Creator address
     * @returns List code id (number[])
     */
  async getCodeIds(ctx: RequestContext, creatorAddress: string) {
    this.logger.log(ctx, `${this.getCodeIds.name} was called with creator address: ${creatorAddress}`);
    try {
      const codeIds = await this.smartContractRepository.getCodeIds(creatorAddress);
      const respones: Array<number> = [];
      codeIds?.forEach(f => {
        respones.push(Number(f.codeId))
      });
      return respones;
    } catch (err) {
      this.logger.error(ctx, `Class ${ContractService.name} call ${this.getCodeIds.name} method error: ${err.stack}`);
      throw err;
    }
  }

  /**
   * Get list contract by creator address
   * @param ctx: RequestContext
   * @param creatorAddress: Creator address 
   * @returns List contract (ContractByCreatorOutputDto[])
   */
  async getContractByCreator(ctx: RequestContext, creatorAddress: string, limit: number, offset: number) {
    this.logger.log(ctx, `${this.getContractByCreator.name} was called with creator address: ${creatorAddress}`);
    try {
      const [constracts, count] = await this.smartContractRepository.getContractByCreator(creatorAddress, limit, offset);

      const mappingData = plainToClass(ContractByCreatorOutputDto, constracts, {
        excludeExtraneousValues: true,
      });

      return [mappingData, count];
    } catch (err) {
      this.logger.error(ctx, `Class ${ContractService.name} call ${this.getContractByCreator.name} method error: ${err.stack}`);
      throw err;
    }
  }
}