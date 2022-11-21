import { Test, TestingModule } from '@nestjs/testing';
import { Cw20TokenService } from '../../../../src/components/cw20-token/services/cw20-token.service';
import { AkcLogger, TokenMarkets } from '../../../../src/shared';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TokenMarketsRepository } from '../../../../src/components/cw20-token/repositories/token-markets.repository';
import { ServiceUtil } from '../../../../src/shared/utils/service.util';
import { HttpModule } from '@nestjs/axios';
import { AccountService } from '../../../../src/components/account/services/account.service';
import { ValidatorRepository } from '../../../../src/components/validator/repositories/validator.repository';
import { Cw20TokenByOwnerParamsDto } from '../../../../src/components/cw20-token/dtos/cw20-token-by-owner-params.dto';

describe('Cw20TokenService', () => {
  let cw20TokenService: Cw20TokenService;
  let tokenMarketsRepository: TokenMarketsRepository;
  let accountService: AccountService;
  let serviceUtil: ServiceUtil;

  const mockFindOneTokenMarkets = (findResult: any) => {
    const findResultSpy = jest
      .spyOn(tokenMarketsRepository, 'findOne')
      .mockResolvedValue(findResult);
    return findResultSpy;
  };

  const mockFindTokenMarkets = (findResult: any[]) => {
    const findResultSpy = jest
      .spyOn(tokenMarketsRepository, 'find')
      .mockResolvedValue(findResult);
    return findResultSpy;
  };

  const mockGetAccountDetailWithResult = (accountDetailResult: any) => {
    const getAccountDetailSpy = jest
      .spyOn(accountService, 'getAccountDetailByAddress')
      .mockResolvedValue(accountDetailResult);
    return getAccountDetailSpy;
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const Cw20TokenServiceProvider = {
      provide: TokenMarketsRepository,
      useFactory: () => ({
        getCw20TokenMarkets: jest.fn(),
        findOne: jest.fn(),
        find: jest.fn(),
      }),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ServiceUtil,
        AccountService,
        ValidatorRepository,
        Cw20TokenServiceProvider,
        Cw20TokenService,
        AkcLogger,
      ],
      imports: [HttpModule],
    }).compile();

    cw20TokenService = module.get(Cw20TokenService);
    tokenMarketsRepository = module.get(
      getRepositoryToken(TokenMarketsRepository),
    );
    accountService = module.get(AccountService);
    serviceUtil = module.get(ServiceUtil);
  });

  describe('getCw20Tokens', () => {
    it('should retrieve Cw20Tokens info', async () => {
      const cw20TokenMarketsResult = {
        list: [{ coin_id: 'aura' }],
        count: 1,
      };

      const getCw20TokenMarketsSpy = jest
        .spyOn(tokenMarketsRepository, 'getCw20TokenMarkets')
        .mockResolvedValue(cw20TokenMarketsResult);

      const result = await cw20TokenService.getCw20Tokens({} as any, {} as any);

      expect(getCw20TokenMarketsSpy).toHaveBeenCalled();

      expect(result.count).toEqual(1);
      expect(result.tokens[0].coin_id).toEqual('aura');
    });
  });

  describe('getTotalAssetByAccountAddress', () => {
    it('should return total asset by account address', async () => {
      const findResult = {
        coin_id: 'aura',
        current_price: 2,
      } as TokenMarkets;

      const findResultSpy = mockFindOneTokenMarkets(findResult);
      const accountDetailResult = { total: 5 };
      const getAccountDetailSpy =
        mockGetAccountDetailWithResult(accountDetailResult);

      const result = await cw20TokenService.getTotalAssetByAccountAddress(
        {} as any,
        '',
      );

      expect(findResultSpy).toHaveBeenCalled();
      expect(getAccountDetailSpy).toHaveBeenCalled();
      expect(result).toBe(findResult.current_price * accountDetailResult.total);
    });
  });

  describe('getPriceById', () => {
    it('should return current price', async () => {
      const findResult = {
        coin_id: 'aura',
        current_price: 2,
      } as TokenMarkets;

      const findResultSpy = mockFindOneTokenMarkets(findResult);

      const result = await cw20TokenService.getPriceById({} as any, '');

      expect(findResultSpy).toHaveBeenCalled();

      expect(result).toBe(findResult.current_price);
    });
  });

  describe('getCw20TokensByOwner', () => {
    it('should return Cw20 tokens by owner', async () => {
      const accountDetailResult = { total: 5 };
      mockGetAccountDetailWithResult(accountDetailResult);

      const findResult = {
        coin_id: 'aura',
        current_price: 2,
      } as TokenMarkets;
      mockFindOneTokenMarkets(findResult);
      const listTokens = [
        {
          coin_id: 'abcCoin',
          current_price: 2,
          contract_address: 'contract_address_test',
        } as TokenMarkets,
        {
          coin_id: 'abcCoin2',
          current_price: 3,
          contract_address: 'contract_address_test_2',
        } as TokenMarkets,
      ];
      mockFindTokenMarkets(listTokens);

      const resultAccountInfo = {
        data: { account_balances: [{ minimal_denom: 1 }] },
      };

      const resultGetByOwner = {
        data: {
          assets: {
            CW20: {
              count: 2,
              asset: [
                {
                  contract_address: 'contract_address_test',
                  asset_info: { data: { name: 'abcCoin' } },
                },
                {
                  contract_address: 'contract_address_test_2',
                  asset_info: { data: { name: 'abcCoin2' } },
                },
              ],
            },
          },
        },
      };

      jest
        .spyOn(serviceUtil, 'getDataAPI')
        .mockResolvedValueOnce(resultAccountInfo)
        .mockResolvedValue(resultGetByOwner);

      const result = await cw20TokenService.getCw20TokensByOwner(
        {} as any,
        {
          keyword: '',
          account_address: 'account_address',
          limit: 10,
          offset: 0,
        } as Cw20TokenByOwnerParamsDto,
      );

      expect(result.count).toBe(4);

      const listCoinName = result.tokens.map((f) => f.name);
      expect(listCoinName.includes('Aura')).toBe(true);
      expect(listCoinName.includes('abcCoin')).toBe(true);
      expect(result.tokens.find((f) => f.name === 'abcCoin').price).toBe(2);
      expect(listCoinName.includes('abcCoin2')).toBe(true);
      expect(result.tokens.find((f) => f.name === 'abcCoin2').price).toBe(3);
    });
  });
});
