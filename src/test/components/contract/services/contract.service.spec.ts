import { ConfigService } from '@nestjs/config';
import { ContractService } from '../../../../components/contract/services/contract.service';
import { ServiceUtil } from '../../../../shared/utils/service.util';
import { HttpModule, HttpService } from '@nestjs/axios';
import { SoulboundTokenRepository } from '../../../../components/soulbound-token/repositories/soulbound-token.repository';
import { ContractUtil } from '../../../../shared/utils/contract.util';
import {
  AkcLogger,
  CONTRACT_STATUS,
  ERROR_MAP,
  RequestContext,
} from '../../../../shared';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { VerifyCodeIdParamsDto } from '../../../../components/contract/dtos/verify-code-id-params.dto';
import * as appConfig from '../../../../shared/configs/configuration';
import { of } from 'rxjs';

describe('ContractService', () => {
  let contractService: ContractService;
  let serviceUtil: ServiceUtil;
  let configService: ConfigService;
  let httpService: HttpService;
  let soulboundTokenRepository: SoulboundTokenRepository;
  let contractUtil: ContractUtil;

  const ctxMock = {} as unknown as RequestContext;
  const appParams = appConfig.default();
  const chainDB = appParams.indexerV2.chainDB;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: ServiceUtil,
          useValue: {
            fetchDataFromGraphQL: jest.fn(),
          },
        },
        ContractUtil,
        ContractService,
        ConfigService,
        AkcLogger,
        {
          provide: SoulboundTokenRepository,
          useValue: {
            findOne: jest.fn(),
            update: jest.fn(),
          },
        },
      ],
      imports: [HttpModule],
    }).compile();

    contractService = module.get(ContractService);
    serviceUtil = module.get(ServiceUtil);
    configService = module.get(ConfigService);
    httpService = module.get(HttpService);
    contractUtil = module.get(ContractUtil);
    soulboundTokenRepository = module.get(
      getRepositoryToken(SoulboundTokenRepository),
    );
  });

  it('should be defined', () => {
    expect(contractService).toBeDefined();
    expect(serviceUtil).toBeDefined();
    expect(configService).toBeDefined();
    expect(httpService).toBeDefined();
    expect(contractUtil).toBeDefined();
    expect(soulboundTokenRepository).toBeDefined();
  });

  describe('verifyCodeId', () => {
    it('should return error message when contract is not existed.', async () => {
      const paramMock: VerifyCodeIdParamsDto = {
        code_id: 1,
        commit: '',
        url: '',
        compiler_version: '',
        wasm_file: '',
      };

      jest
        .spyOn(serviceUtil, 'fetchDataFromGraphQL')
        .mockResolvedValue({ data: { [chainDB]: { code: [] } } });

      expect(await contractService.verifyCodeId(ctxMock, paramMock)).toEqual({
        Code: ERROR_MAP.CONTRACT_NOT_EXIST.Code,
        Message: ERROR_MAP.CONTRACT_NOT_EXIST.Message,
      });
    });

    it('should return error message when contract is verifying.', async () => {
      const paramMock: VerifyCodeIdParamsDto = {
        code_id: 1,
        commit: '',
        url: '',
        compiler_version: '',
        wasm_file: '',
      };

      jest.spyOn(serviceUtil, 'fetchDataFromGraphQL').mockResolvedValue({
        data: {
          [chainDB]: {
            code: [
              {
                code_id_verifications: [
                  { verification_status: CONTRACT_STATUS.VERIFYING },
                ],
              },
            ],
          },
        },
      });

      expect(await contractService.verifyCodeId(ctxMock, paramMock)).toEqual({
        Code: ERROR_MAP.CONTRACT_VERIFIED_VERIFYING.Code,
        Message: ERROR_MAP.CONTRACT_VERIFIED_VERIFYING.Message,
      });
    });

    it('should return a successful response', async () => {
      const paramMock: VerifyCodeIdParamsDto = {
        code_id: 1,
        commit: '',
        url: '',
        compiler_version: '',
        wasm_file: '',
      };

      jest.spyOn(serviceUtil, 'fetchDataFromGraphQL').mockResolvedValue({
        data: {
          [chainDB]: {
            code: [
              {
                code_id_verifications: [],
              },
            ],
          },
        },
      });

      const data = 'test';
      const response: any = {
        data,
        status: 200,
      };

      jest.spyOn(httpService, 'post').mockImplementation(() => of(response));

      expect(await contractService.verifyCodeId(ctxMock, paramMock)).toEqual(
        data,
      );
    });
  });

  describe('getVerifyCodeStep', () => {
    it('should return success steps', async () => {
      jest.spyOn(serviceUtil, 'fetchDataFromGraphQL').mockResolvedValue({
        data: {
          [chainDB]: {
            code_id_verification: [
              {
                verify_step: {
                  step: 6,
                  result: 'Success',
                  msg_code: 'S006',
                },
              },
            ],
          },
        },
      });

      expect(await contractService.getVerifyCodeStep(ctxMock, 1)).toEqual({
        data: [
          {
            check_id: 1,
            check_name: 'Code ID valid',
            code_id: 1,
            msg_code: 'S001',
            result: 'Success',
          },
          {
            check_id: 2,
            check_name: 'Compiler image format',
            code_id: 1,
            msg_code: 'S002',
            result: 'Success',
          },
          {
            check_id: 3,
            check_name: 'Code ID verification session valid',
            code_id: 1,
            msg_code: 'S003',
            result: 'Success',
          },
          {
            check_id: 4,
            check_name: 'Get Code ID data hash',
            code_id: 1,
            msg_code: 'S004',
            result: 'Success',
          },
          {
            check_id: 5,
            check_name: 'Get source code',
            code_id: 1,
            msg_code: 'S005',
            result: 'Success',
          },
          {
            check_id: 6,
            check_name: 'Compile source code',
            code_id: 1,
            msg_code: 'S006',
            result: 'Success',
          },
          {
            check_id: 7,
            check_name: 'Compare data hash',
            code_id: 1,
            msg_code: null,
            result: 'Pending',
          },
          {
            check_id: 8,
            check_name: 'Internal process',
            code_id: 1,
            msg_code: null,
            result: 'Pending',
          },
        ],
        error: {},
      });
    });

    it('should return errors steps', async () => {
      jest.spyOn(serviceUtil, 'fetchDataFromGraphQL').mockResolvedValue({
        data: {
          [chainDB]: {
            code_id_verification: [
              {
                verify_step: {
                  step: 4,
                  result: 'Success',
                  msg_code: 'S004',
                },
                verification_status: 'FAIL',
              },
            ],
          },
        },
      });

      expect(await contractService.getVerifyCodeStep(ctxMock, 1)).toEqual({
        data: [
          {
            check_id: 1,
            check_name: 'Code ID valid',
            code_id: 1,
            msg_code: 'S001',
            result: 'Success',
          },
          {
            check_id: 2,
            check_name: 'Compiler image format',
            code_id: 1,
            msg_code: 'S002',
            result: 'Success',
          },
          {
            check_id: 3,
            check_name: 'Code ID verification session valid',
            code_id: 1,
            msg_code: 'S003',
            result: 'Success',
          },
          {
            check_id: 4,
            check_name: 'Get Code ID data hash',
            code_id: 1,
            msg_code: 'S004',
            result: 'Success',
          },
          {
            check_id: 5,
            check_name: 'Get source code',
            code_id: 1,
            msg_code: null,
            result: 'Pending',
          },
          {
            check_id: 6,
            check_name: 'Compile source code',
            code_id: 1,
            msg_code: null,
            result: 'Pending',
          },
          {
            check_id: 7,
            check_name: 'Compare data hash',
            code_id: 1,
            msg_code: null,
            result: 'Pending',
          },
          {
            check_id: 8,
            check_name: 'Internal process',
            code_id: 1,
            msg_code: null,
            result: 'Pending',
          },
        ],
        error: {
          Code: ERROR_MAP.INFRASTRUCTURE_ERROR.Code,
          Message: ERROR_MAP.INFRASTRUCTURE_ERROR.Message,
        },
      });
    });

    describe('verifyContractStatus', () => {
      it('should return error message when contract is not existed.', async () => {
        jest
          .spyOn(serviceUtil, 'fetchDataFromGraphQL')
          .mockResolvedValue({ data: { [chainDB]: { code: [] } } });

        expect(await contractService.verifyContractStatus(ctxMock, 1)).toEqual({
          Code: ERROR_MAP.CONTRACT_NOT_EXIST.Code,
          Message: ERROR_MAP.CONTRACT_NOT_EXIST.Message,
        });
      });

      it('should return a status UNVERIFIED ', async () => {
        jest.spyOn(serviceUtil, 'fetchDataFromGraphQL').mockResolvedValue({
          data: {
            [chainDB]: {
              code: [
                {
                  code_id: 1,
                  code_id_verifications: [],
                },
              ],
            },
          },
        });

        expect(await contractService.verifyContractStatus(ctxMock, 1)).toEqual({
          codeId: 1,
          status: CONTRACT_STATUS.UNVERIFIED,
        });
      });

      it('should return a status VERIFYING ', async () => {
        jest.spyOn(serviceUtil, 'fetchDataFromGraphQL').mockResolvedValue({
          data: {
            [chainDB]: {
              code: [
                {
                  code_id: 1,
                  code_id_verifications: [
                    {
                      verification_status: CONTRACT_STATUS.VERIFYING,
                    },
                  ],
                },
              ],
            },
          },
        });

        expect(await contractService.verifyContractStatus(ctxMock, 1)).toEqual({
          codeId: 1,
          status: CONTRACT_STATUS.VERIFYING,
        });
      });
    });

    describe('getCW4973Detail', () => {
      it('should return no token data ', async () => {
        jest.spyOn(serviceUtil, 'fetchDataFromGraphQL').mockResolvedValue({
          data: {
            [chainDB]: {
              cw721_contract: [
                {
                  smart_contract: { address: 'test' },
                },
              ],
            },
          },
        });

        jest.spyOn(soulboundTokenRepository, 'findOne').mockResolvedValue(null);

        expect(
          await contractService.getCW4973Detail(ctxMock, 'test', 'test'),
        ).toEqual(null);
      });

      it('should return successful response', async () => {
        jest.spyOn(serviceUtil, 'fetchDataFromGraphQL').mockResolvedValue({
          data: {
            [chainDB]: {
              cw721_contract: [
                {
                  smart_contract: {
                    address: 'address',
                  },
                  minter: 'minter',
                  name: 'name',
                },
              ],
            },
          },
        });

        const nft: any = {
          id: 1,
          contract_address: '',
          token_id: 'token_id',
          token_uri: 'token_uri',
          token_name: 'token_name',
          token_name_ipfs: 'token_name_ipfs',
          animation_url: 'animation_url',
          token_img: 'token_img',
          img_type: 'img_type',
          receiver_address: 'receiver_address',
          status: 'status',
          picked: 'picked',
          signature: 'signature',
          pub_key: 'pub_key',
          minter_address: '',
          type: 'CW4973',
          ipfs: null,
        };

        jest.spyOn(soulboundTokenRepository, 'findOne').mockResolvedValue(nft);

        const response: any = {
          data: {},
          status: 200,
        };

        jest.spyOn(httpService, 'get').mockImplementation(() => of(response));

        expect(
          await contractService.getCW4973Detail(ctxMock, 'test', 'test'),
        ).toEqual({
          id: 1,
          contract_address: 'address',
          token_id: 'token_id',
          token_uri: 'token_uri',
          token_name: 'name',
          token_name_ipfs: 'token_name',
          animation_url: 'animation_url',
          token_img: 'token_img',
          img_type: 'img_type',
          receiver_address: 'receiver_address',
          status: 'status',
          picked: 'picked',
          signature: 'signature',
          pub_key: 'pub_key',
          minter_address: 'minter',
          type: 'CW4973',
          ipfs: {},
        });
      });
    });
  });
});
