import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { plainToClass } from 'class-transformer';
import { lastValueFrom, retry, timeout } from 'rxjs';
import {
  AkcLogger,
  CONTRACT_STATUS,
  ERROR_MAP,
  INDEXER_API_V2,
  INFRASTRUCTURE_ERROR,
  RequestContext,
  VERIFY_CODE_RESULT,
  VERIFY_STEP,
} from '../../../shared';
import { ServiceUtil } from '../../../shared/utils/service.util';
import * as appConfig from '../../../shared/configs/configuration';
import * as util from 'util';
import { VerifyCodeStepOutputDto } from '../dtos/verify-code-step-output.dto';
import { VerifyCodeIdParamsDto } from '../dtos/verify-code-id-params.dto';
import { SoulboundTokenRepository } from '../../soulbound-token/repositories/soulbound-token.repository';
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
    private soulboundTokenRepository: SoulboundTokenRepository,
    private contractUtil: ContractUtil,
  ) {
    this.logger.setContext(ContractService.name);
    this.verifyContractUrl = this.configService.get('VERIFY_CONTRACT_URL');
    const appParams = appConfig.default();
    this.chainDB = appParams.indexerV2.chainDB;
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

    const codeVerificationAttributes = `verify_step
      verification_status`;

    const graphqlQuery = {
      query: util.format(
        INDEXER_API_V2.GRAPH_QL.VERIFY_STEP,
        this.chainDB,
        codeVerificationAttributes,
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
    let error = {};
    if (
      response[0].verify_step.step === INFRASTRUCTURE_ERROR.STEP &&
      response[0].verify_step.result === VERIFY_CODE_RESULT.SUCCESS &&
      response[0].verification_status === INFRASTRUCTURE_ERROR.FAIL
    ) {
      error = ERROR_MAP.INFRASTRUCTURE_ERROR;
    }

    return { data, error };
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

  async getCW4973Detail(
    ctx: RequestContext,
    contractAddress: string,
    tokenId: string,
  ) {
    this.logger.log(ctx, `${this.getCW4973Detail.name} was called!`);
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
      const token = await this.soulboundTokenRepository.findOne({
        where: {
          token_id: tokenId,
          contract_address: cw4973Contract[0].smart_contract.address,
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
        contract_address: cw4973Contract[0].smart_contract.address,
        token_id: token?.token_id || '',
        token_uri: token?.token_uri || '',
        token_name: cw4973Contract[0].name || '',
        token_name_ipfs: token?.token_name || '',
        animation_url: token?.animation_url || '',
        token_img: token?.token_img || '',
        img_type: token?.img_type || '',
        receiver_address: token?.receiver_address || '',
        status: token?.status || '',
        picked: token?.picked || '',
        signature: token?.signature || '',
        pub_key: token?.pub_key || '',
        minter_address: cw4973Contract[0].minter || '',
        type: 'CW4973',
        ipfs: JSON.parse(token?.ipfs) || '',
      };
      return nft;
    }
  }
}
