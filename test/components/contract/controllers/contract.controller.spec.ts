import { Test, TestingModule } from '@nestjs/testing';
import { CacheModule } from '@nestjs/common';
import { AkcLogger, CONTRACT_STATUS } from '../../../../src/shared';
import { ContractController } from '../../../../src/components/contract/controllers/contract.controller';
import { ContractService } from '../../../../src/components/contract/services/contract.service';
import { ContractStatusOutputDto } from '../../../../src/components/contract/dtos/contract-status-output.dto';

describe('ContractController', () => {
  let spyService: ContractService;
  let contractController: ContractController;

  beforeEach(async () => {
    const ContractServiceProvider = {
      provide: ContractService,
      useFactory: () => ({
        getContracts: jest.fn(),
        getSmartContractStatus: jest.fn(),
        getContractByCreator: jest.fn(),
        getContractByAddress: jest.fn(),
      }),
    };
    const app: TestingModule = await Test.createTestingModule({
      controllers: [ContractController],
      providers: [ContractServiceProvider, AkcLogger],
      imports: [CacheModule.register({})],
    }).compile();

    contractController = app.get<ContractController>(ContractController);
    spyService = app.get<ContractService>(ContractService);
  });

  describe('getContracts', () => {
    const serviceResult = {
      contracts: [{ code_id: 1, contract_address: 'contract_address' }],
      count: 1,
    };
    beforeEach(() => {
      jest.spyOn(spyService, 'getContracts').mockResolvedValue(serviceResult);
    });
    it('should call service getContractCodes', async () => {
      await contractController.getContracts({} as any, {} as any);
      expect(spyService.getContracts).toHaveBeenCalled();
    });

    it('should retrieve contract codes info', async () => {
      const expectResult = {
        data: serviceResult.contracts,
        meta: { count: serviceResult.count },
      };
      const result = await contractController.getContracts(
        {} as any,
        {} as any,
      );
      expect(result).toEqual(expectResult);
    });
  });

  describe('getSmartContractStatus', () => {
    const serviceResult: any[] = [
      { key: 'UNVERIFIED', label: CONTRACT_STATUS.UNVERIFIED },
    ];
    beforeEach(() => {
      jest
        .spyOn(spyService, 'getSmartContractStatus')
        .mockReturnValue(serviceResult);
    });
    it('should call service getSmartContractStatus', async () => {
      await contractController.getSmartContractStatus();
      expect(spyService.getSmartContractStatus).toHaveBeenCalled();
    });

    it('should retrieve smart contract status info', async () => {
      const expectResult = {
        data: serviceResult,
        meta: {},
      };
      const result = await contractController.getSmartContractStatus();

      expect(result).toEqual(expectResult);
    });
  });

  describe('getContractByAddress', () => {
    const serviceResult: any = {
      code_id: 1,
      contract_address: 'contract_address',
    };
    beforeEach(() => {
      jest
        .spyOn(spyService, 'getContractByAddress')
        .mockResolvedValue(serviceResult);
    });
    it('should call service getContractByAddress', async () => {
      await contractController.getContractByAddress({} as any, {} as any);
      expect(spyService.getContractByAddress).toHaveBeenCalled();
    });

    it('should retrieve contract info', async () => {
      const expectResult = {
        data: serviceResult,
        meta: {},
      };
      const result = await contractController.getContractByAddress(
        {} as any,
        {} as any,
      );
      expect(result).toEqual(expectResult);
    });
  });

  describe('getContractByCreator', () => {
    const serviceResult: any = [
      [{ code_id: 1, contract_address: 'contract_address' }],
      1,
    ];
    beforeEach(() => {
      jest
        .spyOn(spyService, 'getContractByCreator')
        .mockResolvedValue(serviceResult);
    });

    it('should call service getContractByCreator', async () => {
      await contractController.getContractByCreator({} as any, {} as any);
      expect(spyService.getContractByCreator).toHaveBeenCalled();
    });

    it('should retrieve contracts info', async () => {
      const expectResult = {
        data: serviceResult[0],
        meta: { count: 1 },
      };
      const result = await contractController.getContractByCreator(
        {} as any,
        {} as any,
      );
      expect(result).toEqual(expectResult);
    });
  });
});
