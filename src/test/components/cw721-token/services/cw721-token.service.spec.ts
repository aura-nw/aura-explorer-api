import { Test, TestingModule } from '@nestjs/testing';
import { AkcLogger } from '../../../../../src/shared';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ServiceUtil } from '../../../../../src/shared/utils/service.util';
import { HttpModule } from '@nestjs/axios';
import { AccountService } from '../../../../../src/components/account/services/account.service';
import { ValidatorRepository } from '../../../../../src/components/validator/repositories/validator.repository';
import { Cw721TokenService } from '../../../../../src/components/cw721-token/services/cw721-token.service';
import { SmartContractRepository } from '../../../../../src/components/contract/repositories/smart-contract.repository';
import { NftByOwnerParamsDto } from '../../../../../src/components/cw721-token/dtos/nft-by-owner-params.dto';

describe('Cw721TokenService', () => {
  let cw721TokenService: Cw721TokenService;
  let smartContractRepository: SmartContractRepository;
  let serviceUtil: ServiceUtil;

  const mockSmartContractRepository = (methodName: any, findResult: any) => {
    const findResultSpy = jest
      .spyOn(smartContractRepository, methodName)
      .mockResolvedValue(findResult);
    return findResultSpy;
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const Cw721TokenServiceProvider = {
      provide: SmartContractRepository,
      useFactory: () => ({
        getCw721Tokens: jest.fn(),
        findOne: jest.fn(),
        find: jest.fn(),
        getTokensByListContractAddress: jest.fn(),
      }),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ServiceUtil,
        AccountService,
        ValidatorRepository,
        Cw721TokenServiceProvider,
        Cw721TokenService,
        AkcLogger,
      ],
      imports: [HttpModule],
    }).compile();

    cw721TokenService = module.get(Cw721TokenService);
    smartContractRepository = module.get(
      getRepositoryToken(SmartContractRepository),
    );
    serviceUtil = module.get(ServiceUtil);
  });

  describe('getCw721Tokens', () => {
    it('should retrieve Cw721Tokens info', async () => {
      const cw20TokenMarketsResult = [[{ coin_id: 'abc' }], 1];

      const getCw20TokenMarketsSpy = jest
        .spyOn(smartContractRepository, 'getCw721Tokens')
        .mockResolvedValue(cw20TokenMarketsResult);

      const result = await cw721TokenService.getCw721Tokens(
        {} as any,
        {} as any,
      );

      expect(getCw20TokenMarketsSpy).toHaveBeenCalled();

      const expectResult = {
        tokens: [{ coin_id: 'abc' }],
        count: 1,
      };
      expect(result).toEqual(expectResult);
    });
  });

  describe('getNftByContractAddressAndTokenId', () => {
    it('should return Nft info', async () => {
      const contract_address = 'contract_address_test';
      const resultGetByOwner = {
        data: {
          assets: {
            CW721: {
              count: 2,
              asset: [
                {
                  contract_address,
                  is_burned: true,
                },
              ],
            },
          },
        },
      };

      jest.spyOn(serviceUtil, 'getDataAPI').mockResolvedValue(resultGetByOwner);

      const findResult = {
        contract_address,
        token_name: 'abc',
        creator_address: 'creator',
        token_symbol: 'abc',
      };

      mockSmartContractRepository('findOne', findResult);
      const result = await cw721TokenService.getNftByContractAddressAndTokenId(
        {} as any,
        contract_address,
        '',
      );

      expect(result).toEqual({
        contract_address: 'contract_address_test',
        is_burned: true,
        name: 'abc',
        creator: 'creator',
        symbol: 'abc',
        owner: '',
      });
    });
  });

  describe('getNftsByOwner', () => {
    it('should return Nft info by owner', async () => {
      const contract_address = 'contract_address_test';
      const resultGetByOwner = {
        data: {
          assets: {
            CW721: {
              count: 1,
              asset: [
                {
                  contract_address,
                  is_burned: true,
                },
              ],
            },
          },
          nextKey: 'nextKey',
        },
      };

      jest.spyOn(serviceUtil, 'getDataAPI').mockResolvedValue(resultGetByOwner);

      const findResult = [
        {
          contract_address,
          token_name: 'abc',
          creator_address: 'creator',
          symbol: 'abc',
        },
      ];

      mockSmartContractRepository('getTokensByListContractAddress', findResult);
      const result = await cw721TokenService.getNftsByOwner(
        {} as any,
        {
          keyword: 'aura',
          account_address: 'account_address',
          limit: 10,
          next_key: 'abc',
        } as NftByOwnerParamsDto,
      );

      expect(result).toEqual({
        count: 1,
        next_key: 'nextKey',
        tokens: [
          {
            contract_address,
            symbol: 'abc',
            token_name: 'abc',
            is_burned: true,
          },
        ],
      });
    });
  });
});
