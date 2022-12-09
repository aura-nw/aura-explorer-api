import { Test, TestingModule } from '@nestjs/testing';
import { CacheModule } from '@nestjs/common';
import { AkcLogger, CONTRACT_STATUS } from '../../../../../src/shared';
import { ContractController } from '../../../../../src/components/contract/controllers/contract.controller';
import { ContractService } from '../../../../../src/components/contract/services/contract.service';

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
        getTagByAddress: jest.fn(),
        verifyContract: jest.fn(),
        getContractsMatchCreationCode: jest.fn(),
        verifyContractStatus: jest.fn(),
        getCodeIds: jest.fn(),
        getTokenByContractAddress: jest.fn(),
        getContractByCodeId: jest.fn(),
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

  describe('getTagByAddress', () => {
    const serviceResult: any = {
      account_address: 'account_address',
      contract_address: 'contract_address',
      tag: 'tag',
      note: 'note',
    };
    beforeEach(() => {
      jest
        .spyOn(spyService, 'getTagByAddress')
        .mockResolvedValue(serviceResult);
    });
    it('should call service getTagByAddress', async () => {
      await contractController.getTagByAddress({} as any, '', '');
      expect(spyService.getTagByAddress).toHaveBeenCalled();
    });

    it('should retrieve tag info', async () => {
      const expectResult = {
        data: serviceResult,
        meta: {},
      };

      const result = await contractController.getTagByAddress(
        {} as any,
        '',
        '',
      );
      expect(result).toEqual(expectResult);
    });
  });

  describe('verifyContract', () => {
    const serviceResult: any = {
      account_address: 'account_address',
      contract_address: 'contract_address',
    };
    beforeEach(() => {
      jest.spyOn(spyService, 'verifyContract').mockResolvedValue(serviceResult);
    });
    it('should call service verifyContract', async () => {
      await contractController.verifyContract({} as any, {} as any);
      expect(spyService.verifyContract).toHaveBeenCalled();
    });

    it('should retrieve verified contract info', async () => {
      const expectResult = {
        data: serviceResult,
        meta: {},
      };

      const result = await contractController.verifyContract(
        {} as any,
        {} as any,
      );
      expect(result).toEqual(expectResult);
    });
  });

  describe('getContractsMatchCreationCode', () => {
    const serviceResult: any = {
      contracts: {
        code_id: 1,
        contract_address: 'contract_address',
      },
      count: 1,
    };

    beforeEach(() => {
      jest
        .spyOn(spyService, 'getContractsMatchCreationCode')
        .mockResolvedValue(serviceResult);
    });
    it('should call service getContractsMatchCreationCode', async () => {
      await contractController.getContractsMatchCreationCode({} as any, '');
      expect(spyService.getContractsMatchCreationCode).toHaveBeenCalled();
    });

    it('should retrieve contract info', async () => {
      const expectResult = {
        data: serviceResult.contracts,
        meta: { count: 1 },
      };

      const result = await contractController.getContractsMatchCreationCode(
        {} as any,
        '',
      );
      expect(result).toEqual(expectResult);
    });
  });

  describe('verifyContractStatus', () => {
    const serviceResult: any = {
      code_id: 1,
      contract_address: 'contract_address',
    };

    beforeEach(() => {
      jest
        .spyOn(spyService, 'verifyContractStatus')
        .mockResolvedValue(serviceResult);
    });
    it('should call service verifyContractStatus', async () => {
      await contractController.verifyContractStatus({} as any, '');
      expect(spyService.verifyContractStatus).toHaveBeenCalled();
    });

    it('should retrieve verified contract status', async () => {
      const expectResult = {
        data: serviceResult,
        meta: {},
      };

      const result = await contractController.verifyContractStatus(
        {} as any,
        '',
      );
      expect(result).toEqual(expectResult);
    });
  });

  describe('getTokenByContractAddress', () => {
    const serviceResult: any = {
      code_id: 1,
      contract_address: 'contract_address',
      price: 1.23,
      fully_diluted_market_cap: 233,
    };

    beforeEach(() => {
      jest
        .spyOn(spyService, 'getTokenByContractAddress')
        .mockResolvedValue(serviceResult);
    });
    it('should call service getTokenByContractAddress', async () => {
      await contractController.getTokenByContractAddress({} as any, '');
      expect(spyService.getTokenByContractAddress).toHaveBeenCalled();
    });

    it('should retrieve token info', async () => {
      const expectResult = {
        data: serviceResult,
        meta: {},
      };

      const result = await contractController.getTokenByContractAddress(
        {} as any,
        '',
      );
      expect(result).toEqual(expectResult);
    });
  });

  describe('getContractByCodeId', () => {
    const serviceResult: any = {
      code_id: 1,
      contract_address: 'contract_address',
      price: 1.23,
      fully_diluted_market_cap: 233,
    };

    beforeEach(() => {
      jest
        .spyOn(spyService, 'getContractByCodeId')
        .mockResolvedValue(serviceResult);
    });
    it('should call service getContractByCodeId', async () => {
      await contractController.getContractByCodeId({} as any, '');
      expect(spyService.getContractByCodeId).toHaveBeenCalled();
    });

    it('should retrieve contract info', async () => {
      const expectResult = {
        data: serviceResult,
        meta: {},
      };

      const result = await contractController.getContractByCodeId(
        {} as any,
        '',
      );
      expect(result).toEqual(expectResult);
    });
  });

  describe('getCodeIds', () => {
    const serviceResult: any = [1, 4, 6];

    beforeEach(() => {
      jest.spyOn(spyService, 'getCodeIds').mockResolvedValue(serviceResult);
    });
    it('should call service getCodeIds', async () => {
      await contractController.getCodeIds({} as any, '');
      expect(spyService.getCodeIds).toHaveBeenCalled();
    });

    it('should retrieve code ids', async () => {
      const expectResult = {
        data: serviceResult,
        meta: {},
      };

      const result = await contractController.getCodeIds({} as any, '');
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
