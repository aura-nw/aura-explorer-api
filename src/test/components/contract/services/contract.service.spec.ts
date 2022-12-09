import { Test, TestingModule } from '@nestjs/testing';

import { AkcLogger, CONTRACT_STATUS } from '../../../../../src/shared';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TokenMarketsRepository } from '../../../../../src/components/cw20-token/repositories/token-markets.repository';
import { ServiceUtil } from '../../../../../src/shared/utils/service.util';
import { HttpModule, HttpService } from '@nestjs/axios';
import { AccountService } from '../../../../../src/components/account/services/account.service';
import { ValidatorRepository } from '../../../../../src/components/validator/repositories/validator.repository';
import { ContractService } from '../../../../../src/components/contract/services/contract.service';
import { SmartContractRepository } from '../../../../../src/components/contract/repositories/smart-contract.repository';
import { SmartContractCodeRepository } from '../../../../../src/components/contract-code/repositories/smart-contract-code.repository';
import { TagRepository } from '../../../../../src/components/contract/repositories/tag.repository';
import { ConfigService } from '@nestjs/config';
import { of } from 'rxjs';

describe('ContractService', () => {
  let contractService: ContractService;
  let configService: ConfigService;
  let smartContractRepository: SmartContractRepository;
  let smartContractCodeRepository: SmartContractCodeRepository;
  let tokenMarketsRepository: TokenMarketsRepository;
  let tagRepository: TagRepository;
  let accountService: AccountService;
  let serviceUtil: ServiceUtil;
  let httpService: HttpService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const TokenMarketRepositoryProvider = {
      provide: TokenMarketsRepository,
      useFactory: () => ({
        findOne: jest.fn(),
      }),
    };
    const ContractRepositoryProvider = {
      provide: SmartContractRepository,
      useFactory: () => ({
        getContracts: jest.fn(),
        findOne: jest.fn(),
        findAndCount: jest.fn(),
        getCodeIds: jest.fn(),
        getContractByCreator: jest.fn(),
        getTokenByContractAddress: jest.fn(),
      }),
    };
    const ContractCodeRepositoryProvider = {
      provide: SmartContractCodeRepository,
      useFactory: () => ({
        findOne: jest.fn(),
      }),
    };
    const TagRepositoryProvider = {
      provide: TagRepository,
      useFactory: () => ({
        findOne: jest.fn(),
      }),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ServiceUtil,
        AccountService,
        ValidatorRepository,
        TokenMarketRepositoryProvider,
        ContractRepositoryProvider,
        ContractCodeRepositoryProvider,
        TagRepositoryProvider,
        ContractService,
        ConfigService,
        AkcLogger,
      ],
      imports: [HttpModule],
    }).compile();

    contractService = module.get(ContractService);
    tokenMarketsRepository = module.get(
      getRepositoryToken(TokenMarketsRepository),
    );
    smartContractRepository = module.get(
      getRepositoryToken(SmartContractRepository),
    );
    smartContractCodeRepository = module.get(
      getRepositoryToken(SmartContractCodeRepository),
    );
    accountService = module.get(AccountService);
    serviceUtil = module.get(ServiceUtil);
    tagRepository = module.get(TagRepository);
    httpService = module.get(HttpService);
  });

  describe('getContracts', () => {
    it('should retrieve contract info', async () => {
      const cw20TokenMarketsResult = [[{ coin_id: 'aura' }], 1];

      const mockGetContracts = jest
        .spyOn(smartContractRepository, 'getContracts')
        .mockResolvedValue(cw20TokenMarketsResult);

      const result = await contractService.getContracts({} as any, {} as any);

      expect(mockGetContracts).toHaveBeenCalled();

      expect(result.count).toEqual(1);
      expect(result.contracts[0].coin_id).toEqual('aura');
    });
  });

  describe('getContractByAddress', () => {
    it('when not found  smart contract, should return null', async () => {
      const smartContractResult: any = undefined;

      const mockFindOneSmartContract = jest
        .spyOn(smartContractRepository, 'findOne')
        .mockResolvedValue(smartContractResult);

      const result = await contractService.getContractByAddress(
        {} as any,
        'contract_address',
      );

      expect(mockFindOneSmartContract).toHaveBeenCalled();

      expect(result).toEqual(null);
    });
    it('when found smart contract, should retrieve contract info by address', async () => {
      const smartContractResult: any = { code_id: 1 };

      const mockFindOneSmartContract = jest
        .spyOn(smartContractRepository, 'findOne')
        .mockResolvedValue(smartContractResult);

      const smartContractCodeResult: any = { type: 'CW20' };

      const mockFindOneSmartContractCode = jest
        .spyOn(smartContractCodeRepository, 'findOne')
        .mockResolvedValue(smartContractCodeResult);

      const balanceData = { balances: [{ amount: 5 }] };
      jest.spyOn(serviceUtil, 'getDataAPI').mockResolvedValue(balanceData);

      const result = await contractService.getContractByAddress(
        {} as any,
        'contract_address',
      );

      expect(mockFindOneSmartContract).toHaveBeenCalled();
      expect(mockFindOneSmartContractCode).toHaveBeenCalled();

      expect(result).toEqual({
        balance: 5,
        code_id: 1,
        type: 'CW20',
        token_name: '',
        token_symbol: '',
      });
    });
  });

  describe('getTagByAddress', () => {
    it('should retrieve tab info', async () => {
      const tagRepositoryResult: any = { tag: 'tag' };

      const mockGetContracts = jest
        .spyOn(tagRepository, 'findOne')
        .mockResolvedValue(tagRepositoryResult);

      const result = await contractService.getTagByAddress({} as any, '', '');

      expect(mockGetContracts).toHaveBeenCalled();

      expect(result).toEqual(tagRepositoryResult);
    });
  });

  describe('getContractsMatchCreationCode', () => {
    it('when not found smart contract, should return empty', async () => {
      const smartContractResult: any = undefined;

      const mockFindOneSmartContract = jest
        .spyOn(smartContractRepository, 'findOne')
        .mockResolvedValue(smartContractResult);

      const result = await contractService.getContractsMatchCreationCode(
        {} as any,
        'contract_address',
      );

      expect(mockFindOneSmartContract).toHaveBeenCalled();

      expect(result).toEqual({ contracts: [], count: 0 });
    });
    it('when found smart contract, should retrieve contracts info', async () => {
      const smartContractResult: any = { code_id: 1 };

      const mockFindOneSmartContract = jest
        .spyOn(smartContractRepository, 'findOne')
        .mockResolvedValue(smartContractResult);

      const smartContractArrayResult: any = [
        [{ code_id: 1 }, { code_id: 2 }],
        2,
      ];

      const mockFindAndCountSmartContract = jest
        .spyOn(smartContractRepository, 'findAndCount')
        .mockResolvedValue(smartContractArrayResult);

      const result = await contractService.getContractsMatchCreationCode(
        {} as any,
        'contract_address',
      );

      expect(mockFindOneSmartContract).toHaveBeenCalled();
      expect(mockFindAndCountSmartContract).toHaveBeenCalled();

      expect(result).toEqual({
        contracts: smartContractArrayResult[0],
        count: 2,
      });
    });
  });

  describe('verifyContractStatus', () => {
    it('when not found smart contract, should return E002 error', async () => {
      const smartContractResult: any = undefined;

      const mockFindOneSmartContract = jest
        .spyOn(smartContractRepository, 'findOne')
        .mockResolvedValue(smartContractResult);

      const result = await contractService.verifyContractStatus(
        {} as any,
        'contract_address',
      );

      expect(mockFindOneSmartContract).toHaveBeenCalled();

      expect(result).toEqual({
        Code: 'E002',
        Message: "Contract isn't existed",
      });
    });
    it('when found smart contract, should status info', async () => {
      const smartContractResult: any = { code_id: 1 };

      const mockFindOneSmartContract = jest
        .spyOn(smartContractRepository, 'findOne')
        .mockResolvedValue(smartContractResult);

      const getStatusResult: any = { data: { status: 'correct' } };
      jest
        .spyOn(httpService, 'get')
        .mockImplementation(() => of(getStatusResult));

      const result = await contractService.verifyContractStatus(
        {} as any,
        'contract_address',
      );

      expect(mockFindOneSmartContract).toHaveBeenCalled();

      expect(result).toEqual({ status: 'correct' });
    });
  });

  describe('verifyContract', () => {
    it('when not found  smart contract, should return E001 error', async () => {
      const smartContractResult: any = undefined;

      const mockFindOneSmartContract = jest
        .spyOn(smartContractRepository, 'findOne')
        .mockResolvedValue(smartContractResult);

      const result = await contractService.verifyContract({} as any, {} as any);

      expect(mockFindOneSmartContract).toHaveBeenCalled();

      expect(result).toEqual({
        Code: 'E001',
        Message: 'Contract has been verified',
      });
    });
    it('when found smart contract and contract statis is not UNVERIFIED, should return E001 error', async () => {
      const smartContractResult: any = {
        code_id: 1,
        contract_verification: CONTRACT_STATUS.TBD,
      };

      const mockFindOneSmartContract = jest
        .spyOn(smartContractRepository, 'findOne')
        .mockResolvedValue(smartContractResult);

      const result = await contractService.verifyContract({} as any, {} as any);

      expect(mockFindOneSmartContract).toHaveBeenCalled();
      expect(result).toEqual({
        Code: 'E001',
        Message: 'Contract has been verified',
      });
    });
    it('when found smart contract and contract statis is UNVERIFIED, should verify contract', async () => {
      const smartContractResult: any = {
        code_id: 1,
        contract_verification: CONTRACT_STATUS.UNVERIFIED,
      };

      const mockFindOneSmartContract = jest
        .spyOn(smartContractRepository, 'findOne')
        .mockResolvedValue(smartContractResult);

      const verifyContractResult: any = { data: { status: 'verified' } };
      jest
        .spyOn(httpService, 'post')
        .mockImplementation(() => of(verifyContractResult));
      const result = await contractService.verifyContract({} as any, {} as any);

      expect(mockFindOneSmartContract).toHaveBeenCalled();
      console.log(result);
      expect(result).toEqual(verifyContractResult.data);
    });
  });

  describe('getSmartContractStatus', () => {
    it('should receive smart contract status', async () => {
      const result = await contractService.getSmartContractStatus();
      const statusExpect = [
        { key: 'UNVERIFIED', label: 'UNVERIFIED' },
        { key: 'NOT_REGISTERED', label: 'Not registered' },
        { key: 'TBD', label: 'TBD' },
        { key: 'DEPLOYED', label: 'Deployed' },
        { key: 'REJECTED', label: 'Rejected' },
      ];
      expect(result).toEqual(statusExpect);
    });
  });

  describe('getTokenByContractAddress', () => {
    it('should receive token info', async () => {
      const smartContractResult: any[] = [
        { contract_address: 'contract_address' },
      ];

      jest
        .spyOn(smartContractRepository, 'getTokenByContractAddress')
        .mockResolvedValue(smartContractResult);

      const tokenCodntractResult: any = {
        price: 1.23,
        max_total_supply: 1000,
        circulating_market_cap: 10000,
      };
      jest
        .spyOn(tokenMarketsRepository, 'findOne')
        .mockResolvedValue(tokenCodntractResult);

      const holderResult: any = {
        data: { data: [{ new_holders: 40, change_percent: 10 }] },
      };
      jest.spyOn(httpService, 'get').mockImplementation(() => of(holderResult));
      const result = await contractService.getTokenByContractAddress(
        {} as any,
        '',
      );

      expect(result).toEqual({
        circulating_market_cap: 10000,
        contract_address: 'contract_address',
        fully_diluted_market_cap: 0,
        holders_change_percentage_24h: 10,
        max_total_supply: 0,
        num_holder: 40,
        price: 0,
        price_change_percentage_24h: 0,
      });
    });
  });

  describe('getContractByCodeId', () => {
    it('should receive contract info', async () => {
      const smartContractResult: any = { code_id: 1 };

      jest
        .spyOn(smartContractRepository, 'findOne')
        .mockResolvedValue(smartContractResult);
      const result = await contractService.getContractByCodeId({} as any, '');

      expect(result).toEqual(smartContractResult);
    });
  });

  describe('getCodeIds', () => {
    it('should receive list code id', async () => {
      const smartContractResult: number[] = [];

      jest
        .spyOn(smartContractRepository, 'getCodeIds')
        .mockResolvedValue(smartContractResult);
      const result = await contractService.getCodeIds({} as any, '');

      expect(result).toEqual(smartContractResult);
    });
  });

  describe('getContractByCreator', () => {
    it('should receive contract', async () => {
      const contractResult = [
        [{ coin_id: 'aura', height: 1, code_id: 1, contract_name: 'abc' }],
        1,
      ];

      const mockGetContracts = jest
        .spyOn(smartContractRepository, 'getContractByCreator')
        .mockResolvedValue(contractResult);
      const result: any = await contractService.getContractByCreator(
        {} as any,
        {} as any,
      );

      expect(mockGetContracts).toHaveBeenCalled();
      console.log(result[0]);
      expect(result[0][0]?.contract_name).toEqual('abc');
      expect(result[0][0]?.code_id).toEqual(1);
      expect(result[0][0]?.height).toEqual(1);
    });
  });
});
