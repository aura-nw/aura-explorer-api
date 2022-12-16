import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { plainToClass } from 'class-transformer';
import { lastValueFrom } from 'rxjs';
import { Not } from 'typeorm';
import { SmartContractCodeRepository } from '../../../components/contract-code/repositories/smart-contract-code.repository';
import {
  AkcLogger,
  CONTRACT_CODE_RESULT,
  CONTRACT_STATUS,
  ERROR_MAP,
  INDEXER_API,
  RequestContext,
} from '../../../shared';
import { ServiceUtil } from '../../../shared/utils/service.util';
import { ContractByCreatorOutputDto } from '../dtos/contract-by-creator-output.dto';
import { ContractByCreatorParamsDto } from '../dtos/contract-by-creator-params.dto';
import { ContractParamsDto } from '../dtos/contract-params.dto';
import { ContractStatusOutputDto } from '../dtos/contract-status-output.dto';
import { VerifyContractParamsDto } from '../dtos/verify-contract-params.dto';
import { SmartContractRepository } from '../repositories/smart-contract.repository';
import { TagRepository } from '../repositories/tag.repository';
import * as appConfig from '../../../shared/configs/configuration';
import * as util from 'util';
import { TokenMarketsRepository } from '../../cw20-token/repositories/token-markets.repository';
@Injectable()
export class ContractService {
  private api;
  private rpc;
  private verifyContractUrl;
  private verifyContractStatusUrl;
  private appParams;
  private indexerUrl: string;
  private indexerChainId: string;

  constructor(
    private readonly logger: AkcLogger,
    private smartContractRepository: SmartContractRepository,
    private tagRepository: TagRepository,
    private smartContractCodeRepository: SmartContractCodeRepository,
    private serviceUtil: ServiceUtil,
    private configService: ConfigService,
    private httpService: HttpService,
    private tokenMarketsRepository: TokenMarketsRepository,
  ) {
    this.logger.setContext(ContractService.name);
    this.api = this.configService.get('API');
    this.rpc = this.configService.get('RPC');
    this.verifyContractUrl = this.configService.get('VERIFY_CONTRACT_URL');
    this.verifyContractStatusUrl = this.configService.get(
      'VERIFY_CONTRACT_STATUS_URL',
    );
    this.appParams = appConfig.default();
    this.indexerUrl = this.appParams.indexer.url;
    this.indexerChainId = this.appParams.indexer.chainId;
  }

  async getContracts(
    ctx: RequestContext,
    request: ContractParamsDto,
  ): Promise<any> {
    this.logger.log(ctx, `${this.getContracts.name} was called!`);
    const [contracts, count] = await this.smartContractRepository.getContracts(
      request,
    );

    return { contracts, count };
  }

  async getContractByAddress(
    ctx: RequestContext,
    contractAddress: string,
  ): Promise<any> {
    this.logger.log(ctx, `${this.getContractByAddress.name} was called!`);
    let contract: any = null;
    const contractData = await this.smartContractRepository.findOne({
      where: { contract_address: contractAddress },
    });
    if (contractData) {
      contract = contractData;
      const codeId = contractData.code_id;
      const balanceParams = `cosmos/bank/v1beta1/balances/${contractAddress}`;
      const [balanceData] = await Promise.all([
        this.serviceUtil.getDataAPI(this.api, balanceParams, ctx),
      ]);
      contract.balance = 0;
      if (
        balanceData &&
        balanceData?.balances &&
        balanceData?.balances?.length > 0
      ) {
        contract.balance = Number(balanceData.balances[0].amount);
      }
      const contractCode = await this.smartContractCodeRepository.findOne({
        where: {
          code_id: codeId,
        },
      });
      contract.type = contractCode ? contractCode.type : '';
      const result = contractCode ? contractCode.result : '';
      if (result !== CONTRACT_CODE_RESULT.CORRECT) {
        contract.token_name = '';
        contract.token_symbol = '';
      }
    }
    return contract;
  }

  async getTagByAddress(
    ctx: RequestContext,
    accountAddress: string,
    contractAddress: string,
  ): Promise<any> {
    this.logger.log(ctx, `${this.getTagByAddress.name} was called!`);
    const tag = this.tagRepository.findOne({
      where: {
        account_address: accountAddress,
        contract_address: contractAddress,
      },
    });

    return tag;
  }

  async verifyContract(
    ctx: RequestContext,
    request: VerifyContractParamsDto,
  ): Promise<any> {
    this.logger.log(ctx, `${this.verifyContract.name} was called!`);
    const contract = await this.smartContractRepository.findOne({
      where: { contract_address: request.contract_address },
    });
    if (
      !contract ||
      (contract &&
        contract.contract_verification !== CONTRACT_STATUS.UNVERIFIED)
    ) {
      const error = {
        Code: ERROR_MAP.CONTRACT_VERIFIED.Code,
        Message: ERROR_MAP.CONTRACT_VERIFIED.Message,
      };
      return error;
    }
    const properties = {
      commit: request.commit,
      compilerVersion: request.compiler_version,
      contractAddress: request.contract_address,
      contractUrl: request.url,
      wasmFile: request.wasm_file,
    };
    const result = await lastValueFrom(
      this.httpService.post(this.verifyContractUrl, properties),
    ).then((rs) => rs.data);

    return result;
  }

  async getContractsMatchCreationCode(
    ctx: RequestContext,
    contractAddress: string,
  ): Promise<any> {
    this.logger.log(
      ctx,
      `${this.getContractsMatchCreationCode.name} was called!`,
    );
    const contract = await this.smartContractRepository.findOne({
      where: { contract_address: contractAddress },
    });
    let contracts = [];
    let count = 0;
    if (contract) {
      const contractHash = contract.contract_hash;
      [contracts, count] = await this.smartContractRepository.findAndCount({
        where: {
          contract_address: Not(contractAddress),
          contract_hash: contractHash,
        },
        order: { updated_at: 'DESC' },
      });
    }

    return { contracts: contracts, count };
  }

  async verifyContractStatus(
    ctx: RequestContext,
    contractAddress: string,
  ): Promise<any> {
    this.logger.log(ctx, `${this.verifyContractStatus.name} was called!`);
    const contract = await this.smartContractRepository.findOne({
      where: { contract_address: contractAddress },
    });
    if (contract) {
      const result = await lastValueFrom(
        this.httpService.get(
          this.verifyContractStatusUrl + String(contract.code_id),
        ),
      ).then((rs) => rs.data);

      return result;
    } else {
      const error = {
        Code: ERROR_MAP.CONTRACT_NOT_EXIST.Code,
        Message: ERROR_MAP.CONTRACT_NOT_EXIST.Message,
      };
      return error;
    }
  }

  /**
   * Get token by contract address
   * @param ctx
   * @param contractAddress
   * @returns
   */
  async getTokenByContractAddress(
    ctx: RequestContext,
    contractAddress: string,
  ) {
    this.logger.log(ctx, `${this.getTokenByContractAddress.name} was called!`);
    let token: any = null;
    const tokenData =
      await this.smartContractRepository.getTokenByContractAddress(
        contractAddress,
      );
    if (tokenData.length > 0) {
      token = tokenData[0];

      const tokenMarketData = await this.tokenMarketsRepository.findOne({
        where: { contract_address: contractAddress },
      });
      token.max_total_supply = tokenMarketData?.max_supply || 0;
      token.circulating_market_cap =
        tokenMarketData?.circulating_market_cap || 0;
      token.price = tokenMarketData?.current_price || 0;
      token.fully_diluted_market_cap = tokenMarketData?.fully_diluted_valuation || token.max_total_supply * token.price;
      token.price_change_percentage_24h = tokenMarketData?.price_change_percentage_24h || 0;
      token.num_holder = 0;
      token.holders_change_percentage_24h = 0;

      const holderResponse = await lastValueFrom(
        this.httpService.get(
          `${this.indexerUrl}${INDEXER_API.GET_HOLDER_INFO_CW20}`,
          {
            params: { chainId: this.indexerChainId, addresses: [contractAddress] },
          },
        ),
      ).then((rs) => rs.data);
  
      const listHolder = holderResponse?.data || [];

      if (listHolder.length > 0) {
        token.num_holder = listHolder[0].holders || 0;
        token.holders_change_percentage_24h = listHolder[0].percentage || 0;
      }
    }

    return token;
  }

  /**
   * Get contract by code id
   * @param ctx
   * @param codeId
   * @returns
   */
  async getContractByCodeId(ctx: RequestContext, codeId: string) {
    this.logger.log(ctx, `${this.getContractByCodeId.name} was called!`);
    const contract = await this.smartContractRepository.findOne({
      where: { code_id: codeId },
    });

    return contract;
  }
}
