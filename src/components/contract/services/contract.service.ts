import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { plainToClass } from 'class-transformer';
import { lastValueFrom, retry, timeout } from 'rxjs';
import { SmartContractCodeRepository } from '../../../components/contract-code/repositories/smart-contract-code.repository';
import {
  AkcLogger,
  CONTRACT_CODE_RESULT,
  CONTRACT_STATUS,
  CONTRACT_TYPE,
  ERROR_MAP,
  INDEXER_API,
  INDEXER_API_V2,
  LENGTH,
  RequestContext,
  VERIFY_CODE_RESULT,
  VERIFY_STEP,
} from '../../../shared';
import { ServiceUtil } from '../../../shared/utils/service.util';
import { ContractParamsDto } from '../dtos/contract-params.dto';
import { SmartContractRepository } from '../repositories/smart-contract.repository';
import { TagRepository } from '../repositories/tag.repository';
import * as appConfig from '../../../shared/configs/configuration';
import * as util from 'util';
import { TokenMarketsRepository } from '../../cw20-token/repositories/token-markets.repository';
import { SmartContract } from '../../../shared/entities/smart-contract.entity';
import { SoulboundTokenRepository } from '../../soulbound-token/repositories/soulbound-token.repository';
import { VerifyCodeStepRepository } from '../repositories/verify-code-step.repository';
import { VerifyCodeStepOutputDto } from '../dtos/verify-code-step-output.dto';
import { ContractCodeIdParamsDto } from '../dtos/contract-code-id-params.dto';
import { VerifyCodeIdParamsDto } from '../dtos/verify-code-id-params.dto';
import { ContractUtil } from '../../../shared/utils/contract.util';
@Injectable()
export class ContractService {
  private api;
  private verifyContractUrl;
  private indexerUrl: string;
  private indexerChainId: string;
  private chainDB: string;

  constructor(
    private readonly logger: AkcLogger,
    private smartContractRepository: SmartContractRepository,
    private tagRepository: TagRepository,
    private smartContractCodeRepository: SmartContractCodeRepository,
    private serviceUtil: ServiceUtil,
    private configService: ConfigService,
    private httpService: HttpService,
    private tokenMarketsRepository: TokenMarketsRepository,
    private soulboundTokenRepository: SoulboundTokenRepository,
    private verifyCodeStepRepository: VerifyCodeStepRepository,
    private contractUtil: ContractUtil,
  ) {
    this.logger.setContext(ContractService.name);
    this.api = this.configService.get('API');
    this.verifyContractUrl = this.configService.get('VERIFY_CONTRACT_URL');
    this.chainDB = appConfig.default().indexerV2.chainDB;
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

  async getContractsCodeId(
    ctx: RequestContext,
    request: ContractCodeIdParamsDto,
  ): Promise<any> {
    this.logger.log(ctx, `${this.getContractsCodeId.name} was called!`);

    // Attributes for contract code list
    const codeAttributes = `code_id
      creator
      store_hash
      type
      status
      created_at
      code_id_verifications {
        verified_at
        compiler_version
        github_url
        verification_status
      }
      smart_contracts {
        address
        name
      }`;

    let where = {};
    if (request?.keyword) {
      const keyword = request.keyword.toLowerCase();
      const byCodeId = Number(keyword) && Number(keyword) > 0;
      if (byCodeId) {
        where = { code_id: { _eq: keyword } };
      } else if (keyword.length === LENGTH.CONTRACT_ADDRESS) {
        where = { smart_contracts: { address: { _eq: keyword } } };
      } else {
        where = { creator: { _eq: keyword } };
      }
    }

    const graphqlQuery = {
      query: util.format(
        INDEXER_API_V2.GRAPH_QL.CONTRACT_CODE_LIST,
        this.chainDB,
        this.chainDB,
        codeAttributes,
      ),
      variables: {
        where: where,
        limit: request.limit,
        offset: request.offset,
      },
      operationName: INDEXER_API_V2.OPERATION_NAME.CONTRACT_CODE_LIST,
    };

    const response = (await this.serviceUtil.fetchDataFromGraphQL(graphqlQuery))
      .data[this.chainDB];

    return {
      contracts: response?.code,
      count: response?.code_aggregate.aggregate.count,
    };
  }

  async getContractsCodeIdDetail(
    ctx: RequestContext,
    codeId: number,
  ): Promise<any> {
    this.logger.log(ctx, `${this.getContractsCodeIdDetail.name} was called!`);
    return this.getCodeDetail(codeId);
  }

  private async getCodeDetail(codeId: number) {
    // Attributes for contract code detail
    const codeAttributes = `code_id
      creator
      store_hash
      type
      status
      created_at
      code_id_verifications {
        verified_at
        compiler_version
        github_url
        verification_status
        verify_step
      }
      smart_contracts {
        address
        name
      }`;

    const where = { code_id: { _eq: codeId } };

    const graphqlQuery = {
      query: util.format(
        INDEXER_API_V2.GRAPH_QL.CONTRACT_CODE_DETAIL,
        this.chainDB,
        this.chainDB,
        codeAttributes,
      ),
      variables: {
        where: where,
      },
      operationName: INDEXER_API_V2.OPERATION_NAME.CONTRACT_CODE_DETAIL,
    };

    const contracts = (
      await this.serviceUtil.fetchDataFromGraphQL(graphqlQuery)
    ).data[this.chainDB]['code'];

    return contracts;
  }

  async getContractByAddress(
    ctx: RequestContext,
    contractAddress: string,
  ): Promise<any> {
    this.logger.log(ctx, `${this.getContractByAddress.name} was called!`);
    let contract: any = null;
    const contractData =
      await this.smartContractRepository.getContractsByContractAddress(
        contractAddress,
      );
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

  async verifyCodeId(
    ctx: RequestContext,
    request: VerifyCodeIdParamsDto,
  ): Promise<any> {
    this.logger.log(ctx, `${this.verifyCodeId.name} was called!`);
    const contract = await this.getCodeDetail(request.code_id);
    if (contract?.length === 0) {
      const error = {
        Code: ERROR_MAP.CONTRACT_NOT_EXIST.Code,
        Message: ERROR_MAP.CONTRACT_NOT_EXIST.Message,
      };
      return error;
    }
    const codeVerification = contract[0].code_id_verifications;
    if (
      codeVerification.length > 0 &&
      codeVerification[0].verification_status !== CONTRACT_STATUS.VERIFYFAIL
    ) {
      const error = {
        Code: ERROR_MAP.CONTRACT_VERIFIED_VERIFYING.Code,
        Message: ERROR_MAP.CONTRACT_VERIFIED_VERIFYING.Message,
      };
      return error;
    }

    const properties = {
      codeId: contract.code_id,
      commit: request.commit,
      compilerVersion: request.compiler_version,
      contractUrl: request.url,
      wasmFile: request.wasm_file,
    };
    const result = await lastValueFrom(
      this.httpService.post(this.verifyContractUrl, properties),
    ).then((rs) => rs.data);

    return result;
  }

  async getVerifyCodeStep(ctx: RequestContext, codeId: number) {
    this.logger.log(ctx, `${this.getVerifyCodeStep.name} was called!`);

    const graphqlQuery = {
      query: util.format(
        INDEXER_API_V2.GRAPH_QL.VERIFY_STEP,
        this.chainDB,
        'verify_step',
      ),
      variables: {
        codeId: codeId,
      },
      operationName: INDEXER_API_V2.OPERATION_NAME.VERIFY_STEP,
    };

    const response = (await this.serviceUtil.fetchDataFromGraphQL(graphqlQuery))
      .data[this.chainDB]['code_id_verification'];

    const verifySteps = [];

    if (response.length > 0) {
      for (let index = 1; index < 9; index++) {
        const defaultStep = {
          code_id: codeId,
          check_id: index,
          check_name: VERIFY_STEP[index - 1].name,
        };
        if (index === response[0].verify_step.step) {
          verifySteps.push({
            ...defaultStep,
            msg_code: response[0].verify_step.msg_code,
            result: response[0].verify_step.result,
          });
        } else if (index < response[0].verify_step.step) {
          verifySteps.push({
            ...defaultStep,
            msg_code: VERIFY_STEP[index - 1].msgCode,
            result: VERIFY_CODE_RESULT.SUCCESS,
          });
        } else {
          verifySteps.push({
            ...defaultStep,
            msg_code: null,
            result: VERIFY_CODE_RESULT.PENDING,
          });
        }
      }
    }
    const data = plainToClass(VerifyCodeStepOutputDto, verifySteps, {
      excludeExtraneousValues: true,
    });
    return data;
  }

  async verifyContractStatus(
    ctx: RequestContext,
    codeId: number,
  ): Promise<any> {
    this.logger.log(ctx, `${this.verifyContractStatus.name} was called!`);
    const contract = await this.getCodeDetail(codeId);
    if (contract?.length === 0) {
      const error = {
        Code: ERROR_MAP.CONTRACT_NOT_EXIST.Code,
        Message: ERROR_MAP.CONTRACT_NOT_EXIST.Message,
      };
      return error;
    }
    return {
      codeId: contract[0].code_id,
      status:
        contract[0].code_id_verifications.length > 0
          ? contract[0].code_id_verifications[0].verification_status
          : CONTRACT_STATUS.UNVERIFIED,
    };
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
      token.fully_diluted_market_cap =
        tokenMarketData?.fully_diluted_valuation ||
        token.max_total_supply * token.price;
      token.price_change_percentage_24h =
        tokenMarketData?.price_change_percentage_24h || 0;
      token.num_holder = 0;
      token.holders_change_percentage_24h = 0;

      const holderResponse = await lastValueFrom(
        this.httpService.get(
          `${this.indexerUrl}${INDEXER_API.GET_HOLDER_INFO_CW20}`,
          {
            params: {
              chainId: this.indexerChainId,
              addresses: [contractAddress],
            },
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

  async getNftDetail(
    ctx: RequestContext,
    contractAddress: string,
    tokenId: string,
  ) {
    // Get contract info
    const smartContract = await this.smartContractRepository.findOne({
      where: {
        contract_address: contractAddress,
      },
    });
    if (smartContract) {
      // Get smartContratctCode info
      const smartContratctCode = await this.smartContractCodeRepository.findOne(
        {
          where: {
            code_id: smartContract.code_id,
          },
        },
      );

      if (smartContratctCode) {
        switch (smartContratctCode.type) {
          case CONTRACT_TYPE.CW4973:
            return this.getCW4973Token(ctx, smartContract, tokenId);
          case CONTRACT_TYPE.CW721:
            return this.getCW721Token(ctx, smartContract, tokenId);
        }
      }
    }
  }

  async getCW721Token(
    ctx: RequestContext,
    smartContract: SmartContract,
    tokenId: string,
  ): Promise<any> {
    this.logger.log(ctx, `${this.getCW721Token.name} was called!`);
    const contractAddress = smartContract.contract_address;

    const url = `${this.indexerUrl}${util.format(
      INDEXER_API.GET_NFT_BY_CONTRACT_ADDRESS_AND_TOKEN_ID,
      this.indexerChainId,
      CONTRACT_TYPE.CW721,
      encodeURIComponent(tokenId),
      contractAddress,
    )}`;
    const result = await this.serviceUtil.getDataAPI(url, '', ctx);
    let nft = null;
    if (result && result.data.assets.CW721.asset.length > 0) {
      nft = result.data.assets.CW721.asset[0];
      nft.name = '';
      nft.creator = '';
      nft.symbol = '';
      nft.type = CONTRACT_TYPE.CW721;
      nft.name = smartContract.token_name;
      nft.creator = smartContract.creator_address;
      nft.symbol = smartContract.token_symbol;
      nft.owner = nft.is_burned ? '' : nft.owner;
    }
    return nft;
  }

  async getCW4973Token(
    ctx: RequestContext,
    smartContract: SmartContract,
    tokenId: string,
  ) {
    this.logger.log(ctx, `${this.getCW4973Token.name} was called!`);
    const token = await this.soulboundTokenRepository.findOne({
      where: {
        token_id: tokenId,
        contract_address: smartContract.contract_address,
      },
    });

    if (!token) {
      return null;
    }

    if (!token?.ipfs || token?.ipfs === '{}') {
      // Get ipfs info
      const ipfs = await lastValueFrom(
        this.httpService
          .get(this.contractUtil.transform(token?.token_uri))
          .pipe(timeout(5000), retry(2)),
      )
        .then((rs) => rs.data)
        .catch(() => {
          return {};
        });

      token.ipfs = JSON.stringify(ipfs);
      await this.soulboundTokenRepository.update(token.id, {
        ipfs: token.ipfs,
      });
    }

    const nft = {
      id: token?.id || '',
      contract_address: smartContract.contract_address,
      token_id: token?.token_id || '',
      token_uri: token?.token_uri || '',
      token_name: smartContract?.token_name || '',
      token_name_ipfs: token?.token_name || '',
      animation_url: token?.animation_url || '',
      token_img: token?.token_img || '',
      img_type: token?.img_type || '',
      receiver_address: token?.receiver_address || '',
      status: token?.status || '',
      picked: token?.picked || '',
      signature: token?.signature || '',
      pub_key: token?.pub_key || '',
      minter_address: smartContract?.minter_address || '',
      description: smartContract?.description || '',
      type: CONTRACT_TYPE.CW4973,
      ipfs: JSON.parse(token?.ipfs) || '',
    };
    return nft;
  }
}
