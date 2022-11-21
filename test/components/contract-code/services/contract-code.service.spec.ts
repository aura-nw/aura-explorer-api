import { Test, TestingModule } from '@nestjs/testing';
import {
  AkcLogger,
  CONTRACT_CODE_RESULT,
  CONTRACT_TYPE,
} from '../../../../src/shared';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ServiceUtil } from '../../../../src/shared/utils/service.util';
import { HttpModule, HttpService } from '@nestjs/axios';
import { AccountService } from '../../../../src/components/account/services/account.service';
import { ValidatorRepository } from '../../../../src/components/validator/repositories/validator.repository';
import { ContractCodeService } from '../../../../src/components/contract-code/services/contract-code.service';
import { SmartContractCodeRepository } from '../../../../src/components/contract-code/repositories/smart-contract-code.repository';
import { of } from 'rxjs';
import { RegisterContractCodeParamsDto } from '../../../../src/components/contract-code/dtos/register-contract-code-params.dto';

describe('ContractCodeService', () => {
  let contractCodeService: ContractCodeService;
  let smartContractCodeRepository: SmartContractCodeRepository;
  let serviceUtil: ServiceUtil;
  let httpService: HttpService;

  const mockSmartContractCodeRepository = (
    methodName: any,
    findResult: any,
  ) => {
    const findResultSpy = jest
      .spyOn(smartContractCodeRepository, methodName)
      .mockResolvedValue(findResult);
    return findResultSpy;
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const ContractCodeServiceProvider = {
      provide: SmartContractCodeRepository,
      useFactory: () => ({
        findAndCount: jest.fn(),
        findOne: jest.fn(),
        save: jest.fn(),
      }),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ServiceUtil,
        AccountService,
        ValidatorRepository,
        ContractCodeServiceProvider,
        ContractCodeService,
        AkcLogger,
      ],
      imports: [HttpModule],
    }).compile();

    contractCodeService = module.get(ContractCodeService);
    smartContractCodeRepository = module.get(
      getRepositoryToken(SmartContractCodeRepository),
    );
    serviceUtil = module.get(ServiceUtil);
    httpService = module.get<HttpService>(HttpService);
  });

  describe('getContractCodes', () => {
    it('should retrieve Contract Codes info', async () => {
      const contract_codes = [
        {
          code_id: 1,
          type: 'CW721',
          result: 'a',
          creator: 'd',
        },
      ];
      const count = 1;
      const contractCodeResult = [contract_codes, count];

      mockSmartContractCodeRepository('findAndCount', contractCodeResult);
      const result = await contractCodeService.getContractCodes(
        {} as any,
        {} as any,
      );

      const expectResult = {
        contract_codes,
        count: 1,
      };
      expect(result).toEqual(expectResult);
    });
  });

  describe('getContractCodeByCodeId', () => {
    it('should retrieve Contract Codes info', async () => {
      const contractCodeResult = {
        code_id: 1,
        type: 'CW721',
        result: 'a',
        creator: 'd',
      };

      mockSmartContractCodeRepository('findOne', contractCodeResult);
      const result = await contractCodeService.getContractCodeByCodeId(
        {} as any,
        {} as any,
      );

      expect(result).toEqual({
        code_id: 1,
        type: 'CW721',
        result: 'a',
        creator: 'd',
      });
    });
  });

  describe('updateContractCode', () => {
    it('when find  SmartContractCode not found, should return error', async () => {
      mockSmartContractCodeRepository('findOne', undefined);

      const result = await contractCodeService.updateContractCode(
        {} as any,
        1,
        { type: 'CW721' } as any,
      );

      expect(result).toEqual({
        Code: 'E004',
        Message: 'Code ID does not exist',
      });
    });

    it('when result is CORRECT, should return error', async () => {
      const contractCodeResult = {
        code_id: 1,
        type: 'CW721',
        result: CONTRACT_CODE_RESULT.CORRECT,
        creator: 'd',
      };

      mockSmartContractCodeRepository('findOne', contractCodeResult);

      const result = await contractCodeService.updateContractCode(
        {} as any,
        1,
        { type: 'CW721' } as any,
      );

      expect(result).toEqual({
        Code: 'E006',
        Message: 'Result is correct, you cannot update this record',
      });
    });

    it('when result is INCORRECT should retrieve Contract Codes info', async () => {
      const contractCodeResult = {
        code_id: 1,
        type: 'CW721',
        result: CONTRACT_CODE_RESULT.INCORRECT,
        creator: 'd',
      };

      mockSmartContractCodeRepository('findOne', contractCodeResult);
      const resudlt: any = {
        status: 200,
      };

      jest.spyOn(httpService, 'post').mockImplementationOnce(() => of(resudlt));
      mockSmartContractCodeRepository('save', contractCodeResult);
      const result = await contractCodeService.updateContractCode(
        {} as any,
        1,
        { type: 'CW721' } as any,
      );

      expect(result).toEqual({
        code_id: 1,
        type: 'CW721',
        result: CONTRACT_CODE_RESULT.TBD,
        creator: 'd',
      });
    });
  });

  describe('registerContractCode', () => {
    it('when find SmartContractCode not found, should return error', async () => {
      mockSmartContractCodeRepository('findOne', undefined);

      const result = await contractCodeService.registerContractCode(
        {} as any,
        {
          code_id: 1,
          type: CONTRACT_TYPE.CW20,
          account_address: 'abc',
        } as RegisterContractCodeParamsDto,
      );

      expect(result).toEqual({
        Code: 'E004',
        Message: 'Code ID does not exist',
      });
    });

    it('when find SmartContractCode has data, type has value, should return error E003', async () => {
      const contractCodeResult = {
        code_id: 1,
        type: 'CW721',
        result: CONTRACT_CODE_RESULT.INCORRECT,
        creator: 'creator',
      };

      mockSmartContractCodeRepository('findOne', contractCodeResult);
      const result = await contractCodeService.registerContractCode(
        {} as any,
        {
          code_id: 1,
          type: CONTRACT_TYPE.CW20,
          account_address: 'account_address',
        } as RegisterContractCodeParamsDto,
      );

      expect(result).toEqual({
        Code: 'E003',
        Message: 'Code ID registered type contract',
      });
    });

    it('when find SmartContractCode has data, type is empty, creator is different account_address, should return error E005', async () => {
      const contractCodeResult = {
        code_id: 1,
        type: '',
        result: CONTRACT_CODE_RESULT.INCORRECT,
        creator: 'creator',
      };

      mockSmartContractCodeRepository('findOne', contractCodeResult);
      const result = await contractCodeService.registerContractCode(
        {} as any,
        {
          code_id: 1,
          type: CONTRACT_TYPE.CW20,
          account_address: 'account_address',
        } as RegisterContractCodeParamsDto,
      );

      expect(result).toEqual({
        Code: 'E005',
        Message: 'You are not the contract owner/creator',
      });
    });

    it('when find SmartContractCode has data, type is empty, creator is same account_address, should register contract code', async () => {
      const contractCodeResult = {
        code_id: 1,
        type: '',
        result: CONTRACT_CODE_RESULT.INCORRECT,
        creator: 'creator',
      };

      mockSmartContractCodeRepository('findOne', contractCodeResult);
      const resudlt: any = {
        status: 200,
      };
      jest.spyOn(httpService, 'post').mockImplementationOnce(() => of(resudlt));
      mockSmartContractCodeRepository('save', contractCodeResult);
      const result = await contractCodeService.registerContractCode(
        {} as any,
        {
          code_id: 1,
          type: CONTRACT_TYPE.CW20,
          account_address: 'creator',
        } as RegisterContractCodeParamsDto,
      );

      expect(result).toEqual({
        code_id: 1,
        creator: 'creator',
        result: CONTRACT_CODE_RESULT.TBD,
        type: CONTRACT_TYPE.CW20,
      });
    });
  });
});
