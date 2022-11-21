import { Test, TestingModule } from '@nestjs/testing';
import { CacheModule } from '@nestjs/common';
import { AkcLogger } from '../../../../src/shared';
import { ContractCodeController } from '../../../../src/components/contract-code/controllers/contract-code.controller';
import { ContractCodeService } from '../../../../src/components/contract-code/services/contract-code.service';

describe('ContractCodeController', () => {
  let spyService: ContractCodeService;
  let contractCodeController: ContractCodeController;

  beforeEach(async () => {
    const ContractCodeServiceProvider = {
      provide: ContractCodeService,
      useFactory: () => ({
        getContractCodes: jest.fn(),
        registerContractCode: jest.fn(),
        getContractCodeByCodeId: jest.fn(),
        updateContractCode: jest.fn(),
      }),
    };
    const app: TestingModule = await Test.createTestingModule({
      controllers: [ContractCodeController],
      providers: [ContractCodeServiceProvider, AkcLogger],
      imports: [CacheModule.register({})],
    }).compile();

    contractCodeController = app.get<ContractCodeController>(
      ContractCodeController,
    );
    spyService = app.get<ContractCodeService>(ContractCodeService);
  });

  describe('getContractCodes', () => {
    const serviceResult = {
      contract_codes: [
        { code_id: 1, type: 'CW721', result: 'Correct', creator: 'creator' },
      ],
      count: 1,
    };
    beforeEach(() => {
      jest
        .spyOn(spyService, 'getContractCodes')
        .mockResolvedValue(serviceResult);
    });
    it('should call service getContractCodes', async () => {
      await contractCodeController.getContractCodes({} as any, {} as any);
      expect(spyService.getContractCodes).toHaveBeenCalled();
    });
    it('should retrieve contract codes info', async () => {
      const expectResult = {
        data: serviceResult.contract_codes,
        meta: { count: serviceResult.count },
      };
      expect(
        await contractCodeController.getContractCodes({} as any, {} as any),
      ).toEqual(expectResult);
    });
  });

  describe('registerContractCode', () => {
    const serviceResult = {
      code_id: 1,
      type: 'CW721',
      result: 'Correct',
      creator: 'creator',
    };
    beforeEach(() => {
      jest
        .spyOn(spyService, 'registerContractCode')
        .mockResolvedValue(serviceResult);
    });
    it('should call service getContractCodes', async () => {
      await contractCodeController.registerContractCode({} as any, {} as any);
      expect(spyService.registerContractCode).toHaveBeenCalled();
    });
    it('should register Contract Code', async () => {
      const expectResult = {
        data: serviceResult,
        meta: {},
      };
      expect(
        await contractCodeController.registerContractCode({} as any, {} as any),
      ).toEqual(expectResult);
    });
  });

  describe('getContractCodeByCodeId', () => {
    const serviceResult = {
      code_id: 1,
      type: 'CW721',
      result: 'Correct',
      creator: 'creator',
    };
    beforeEach(() => {
      jest
        .spyOn(spyService, 'getContractCodeByCodeId')
        .mockResolvedValue(serviceResult);
    });
    it('should call service getContractCodeByCodeId', async () => {
      await contractCodeController.getContractCodeByCodeId(
        {} as any,
        {} as any,
      );
      expect(spyService.getContractCodeByCodeId).toHaveBeenCalled();
    });
    it('should retrieve contract codes info', async () => {
      const expectResult = {
        data: serviceResult,
        meta: {},
      };
      expect(
        await contractCodeController.getContractCodeByCodeId(
          {} as any,
          {} as any,
        ),
      ).toEqual(expectResult);
    });
  });

  describe('updateContractCode', () => {
    const serviceResult = {
      code_id: 1,
      type: 'CW721',
      result: 'Correct',
      creator: 'creator',
    };
    beforeEach(() => {
      jest
        .spyOn(spyService, 'updateContractCode')
        .mockResolvedValue(serviceResult);
    });
    it('should call service updateContractCode', async () => {
      await contractCodeController.updateContractCode({} as any, 1, {} as any);
      expect(spyService.updateContractCode).toHaveBeenCalled();
    });
    it('should retrieve contract codes info', async () => {
      const expectResult = {
        data: serviceResult,
        meta: {},
      };
      expect(
        await contractCodeController.updateContractCode(
          {} as any,
          1,
          {} as any,
        ),
      ).toEqual(expectResult);
    });
  });
});
