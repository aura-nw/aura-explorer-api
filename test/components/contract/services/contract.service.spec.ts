import { Test, TestingModule } from '@nestjs/testing';

import { AkcLogger, TokenMarkets } from '../../../../src/shared';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TokenMarketsRepository } from '../../../../src/components/cw20-token/repositories/token-markets.repository';
import { ServiceUtil } from '../../../../src/shared/utils/service.util';
import { HttpModule, HttpService } from '@nestjs/axios';
import { AccountService } from '../../../../src/components/account/services/account.service';
import { ValidatorRepository } from '../../../../src/components/validator/repositories/validator.repository';
import { Cw20TokenByOwnerParamsDto } from '../../../../src/components/cw20-token/dtos/cw20-token-by-owner-params.dto';
import { ContractService } from '../../../../src/components/contract/services/contract.service';
import { SmartContractRepository } from '../../../../src/components/contract/repositories/smart-contract.repository';
import { SmartContractCodeRepository } from '../../../../src/components/contract-code/repositories/smart-contract-code.repository';
import { TagRepository } from '../../../../src/components/contract/repositories/tag.repository';
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

      expect(result).toEqual({ balance: 5, code_id: 1, type: 'CW20' });
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
});
