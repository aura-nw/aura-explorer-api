import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { plainToClass } from 'class-transformer';
import { lastValueFrom } from 'rxjs';
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
@Injectable()
export class ContractService {
  private verifyContractUrl;
  private chainDB: string;

  constructor(
    private readonly logger: AkcLogger,
    private serviceUtil: ServiceUtil,
    private configService: ConfigService,
    private httpService: HttpService,
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
}
