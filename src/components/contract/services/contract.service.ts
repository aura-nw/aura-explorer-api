import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { plainToClass } from 'class-transformer';
import { lastValueFrom, retry, timeout } from 'rxjs';
import {
  AkcLogger,
  CONTRACT_STATUS,
  CONTRACT_TYPE,
  ERROR_MAP,
  INDEXER_API_V2,
  LENGTH,
  RequestContext,
  VERIFY_CODE_RESULT,
  VERIFY_STEP,
} from '../../../shared';
import { ServiceUtil } from '../../../shared/utils/service.util';
import { SmartContractRepository } from '../repositories/smart-contract.repository';
import * as appConfig from '../../../shared/configs/configuration';
import * as util from 'util';
import { TokenMarketsRepository } from '../../cw20-token/repositories/token-markets.repository';
import { SoulboundTokenRepository } from '../../soulbound-token/repositories/soulbound-token.repository';
import { VerifyCodeStepOutputDto } from '../dtos/verify-code-step-output.dto';
import { ContractCodeIdParamsDto } from '../dtos/contract-code-id-params.dto';
import { VerifyCodeIdParamsDto } from '../dtos/verify-code-id-params.dto';
import { ContractUtil } from '../../../shared/utils/contract.util';
@Injectable()
export class ContractService {
  private verifyContractUrl;
  private chainDB: string;

  constructor(
    private readonly logger: AkcLogger,
    private serviceUtil: ServiceUtil,
    private configService: ConfigService,
    private httpService: HttpService,
    private tokenMarketsRepository: TokenMarketsRepository,
    private soulboundTokenRepository: SoulboundTokenRepository,
    private contractUtil: ContractUtil,
  ) {
    this.logger.setContext(ContractService.name);
    this.verifyContractUrl = this.configService.get('VERIFY_CONTRACT_URL');
    const appParams = appConfig.default();
    this.chainDB = appParams.indexerV2.chainDB;
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
      code_id_verifications(order_by: {updated_at: desc}) {
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
      codeId: contract[0].code_id,
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
        'verify_step,',
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
      for (let index = 0; index < VERIFY_STEP.length; index++) {
        const stepId = index + 1;
        // Get last success element
        const result = response[0];
        const defaultStep = {
          code_id: codeId,
          check_id: stepId,
          check_name: VERIFY_STEP[index].name,
        };
        if (stepId === result?.verify_step.step) {
          verifySteps.push({
            ...defaultStep,
            msg_code: result?.verify_step.msg_code,
            result: result?.verify_step.result,
          });
        } else if (stepId < result?.verify_step.step) {
          verifySteps.push({
            ...defaultStep,
            msg_code: VERIFY_STEP[index].msgCode,
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

    // Attributes for cw20
    const cw20Attributes = `address
       cw20_contract {
         name
         marketing_info
         cw20_holders {
           address
           amount
         }
         decimal
       }
       code {
         code_id_verifications {
           verification_status
         }
       }`;

    const graphqlQuery = {
      query: util.format(
        INDEXER_API_V2.GRAPH_QL.CW20_DETAIL,
        this.chainDB,
        cw20Attributes,
      ),
      variables: {
        address: contractAddress,
      },
      operationName: INDEXER_API_V2.OPERATION_NAME.CW20_DETAIL,
    };

    const [response, tokenMarketData] = await Promise.all([
      this.serviceUtil.fetchDataFromGraphQL(graphqlQuery),
      this.tokenMarketsRepository.findOne({
        where: { contract_address: contractAddress },
      }),
    ]);
    let token;

    const list = response?.data[this.chainDB].smart_contract;
    if (list?.length > 0) {
      token = list[0];
      token.max_total_supply = tokenMarketData?.max_supply || 0;
      token.circulating_market_cap =
        tokenMarketData?.circulating_market_cap || 0;
      token.price = tokenMarketData?.current_price || 0;
      token.verify_status = tokenMarketData?.verify_status || '';
      token.verify_text = tokenMarketData?.verify_text || '';
      token.fully_diluted_market_cap =
        tokenMarketData?.fully_diluted_valuation ||
        token.max_total_supply * token.price;
      token.price_change_percentage_24h =
        tokenMarketData?.price_change_percentage_24h || 0;
      token.holders_change_percentage_24h = 0;
    }

    return token;
  }

  async getNftDetail(
    ctx: RequestContext,
    contractAddress: string,
    tokenId: string,
  ) {
    // Get contract info
    const abtAttributes = `name
      minter
      smart_contract {
       address
      }`;

    const graphqlQuery = {
      query: util.format(
        INDEXER_API_V2.GRAPH_QL.CW4973_CONTRACT,
        this.chainDB,
        abtAttributes,
      ),
      variables: {
        address: contractAddress,
      },
      operationName: INDEXER_API_V2.OPERATION_NAME.CW4973_CONTRACT,
    };

    // Get CW4973 contract
    const cw4973Contract = (
      await this.serviceUtil.fetchDataFromGraphQL(graphqlQuery)
    ).data[this.chainDB]['cw721_contract'];

    if (cw4973Contract.length > 0) {
      return this.getCW4973Token(ctx, cw4973Contract[0], tokenId);
    } else {
      return this.getCW721Token(ctx, contractAddress, tokenId);
    }
  }

  async getCW721Token(
    ctx: RequestContext,
    contractAddress: string,
    tokenId: string,
  ): Promise<any> {
    this.logger.log(ctx, `${this.getCW721Token.name} was called!`);

    const cw721Attributes = `id
      token_id
      owner
      media_info
      burned
      cw721_contract {
        name
        smart_contract {
          name
          address
          creator
        }
        symbol
        minter
      }`;

    const graphqlQuery = {
      query: util.format(
        INDEXER_API_V2.GRAPH_QL.CW721_OWNER,
        this.chainDB,
        cw721Attributes,
      ),
      variables: {
        address: contractAddress,
        tokenId: tokenId,
      },
      operationName: INDEXER_API_V2.OPERATION_NAME.CW721_OWNER,
    };

    const tokens = (await this.serviceUtil.fetchDataFromGraphQL(graphqlQuery))
      .data[this.chainDB]['cw721_token'];

    let nft = null;

    if (tokens?.length > 0) {
      nft = tokens[0];
      nft.owner = nft.burned ? '' : nft.owner;
    }
    return nft;
  }

  async getCW4973Token(ctx: RequestContext, contract: any, tokenId: string) {
    this.logger.log(ctx, `${this.getCW4973Token.name} was called!`);
    const token = await this.soulboundTokenRepository.findOne({
      where: {
        token_id: tokenId,
        contract_address: contract.smart_contract.address,
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
      contract_address: contract.smart_contract.address,
      token_id: token?.token_id || '',
      token_uri: token?.token_uri || '',
      token_name: contract.name || '',
      token_name_ipfs: token?.token_name || '',
      animation_url: token?.animation_url || '',
      token_img: token?.token_img || '',
      img_type: token?.img_type || '',
      receiver_address: token?.receiver_address || '',
      status: token?.status || '',
      picked: token?.picked || '',
      signature: token?.signature || '',
      pub_key: token?.pub_key || '',
      minter_address: contract.minter || '',
      type: CONTRACT_TYPE.CW4973,
      ipfs: JSON.parse(token?.ipfs) || '',
    };
    return nft;
  }
}
