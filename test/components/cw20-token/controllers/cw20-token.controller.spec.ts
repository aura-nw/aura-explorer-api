import { Test, TestingModule } from '@nestjs/testing';
import { CacheModule } from '@nestjs/common';
import { Cw20TokenController } from '../../../../src/components/cw20-token/controllers/cw20-token.controller';
import { Cw20TokenService } from '../../../../src/components/cw20-token/services/cw20-token.service';
import { AkcLogger } from '../../../../src/shared';

export class UserCacheModule {}
describe('Cw20TokenController', () => {
  let spyService: Cw20TokenService;
  let cw20TokenController: Cw20TokenController;
  let cw20TokensByOwnerResult: jest.Mock;

  beforeEach(async () => {
    cw20TokensByOwnerResult = jest.fn();
    const Cw20TokenServiceProvider = {
      provide: Cw20TokenService,
      useFactory: () => ({
        getCw20TokensByOwner: cw20TokensByOwnerResult,
        getCw20Tokens: jest.fn(),
        getPriceById: jest.fn(),
        getTotalAssetByAccountAddress: jest.fn(),
      }),
    };
    const app: TestingModule = await Test.createTestingModule({
      controllers: [Cw20TokenController],
      providers: [Cw20TokenServiceProvider, AkcLogger],
      imports: [CacheModule.register({})],
    }).compile();

    cw20TokenController = app.get<Cw20TokenController>(Cw20TokenController);
    spyService = app.get<Cw20TokenService>(Cw20TokenService);
  });

  describe('getCw20TokensByOwner', () => {
    const serviceResult = {
      tokens: [{ name: 'aura-network', symbol: 'aura', price: 10 }],
      count: 1,
    };
    beforeEach(() => {
      cw20TokensByOwnerResult.mockReturnValue(Promise.resolve(serviceResult));
    });
    it('should call service getCw20TokensByOwner', async () => {
      await cw20TokenController.getCw20TokensByOwner({} as any, {} as any);
      expect(spyService.getCw20TokensByOwner).toHaveBeenCalled();
    });

    it('should retrieve CW20 tokens info', async () => {
      const expectResult = {
        data: serviceResult.tokens,
        meta: { count: serviceResult.count },
      };
      expect(
        await cw20TokenController.getCw20TokensByOwner({} as any, {} as any),
      ).toEqual(expectResult);
    });
  });

  describe('getCw20Tokens', () => {
    const serviceResult = {
      tokens: [{ name: 'aura-network', symbol: 'aura', price: 10 }],
      count: 1,
    };
    beforeEach(() => {
      jest.spyOn(spyService, 'getCw20Tokens').mockResolvedValue(serviceResult);
    });
    it('should call service getCw20Tokens', async () => {
      await cw20TokenController.getCw20Tokens({} as any, {} as any);
      expect(spyService.getCw20Tokens).toHaveBeenCalled();
    });

    it('should retrieve CW20 tokens info', async () => {
      const expectResult = {
        data: serviceResult.tokens,
        meta: { count: serviceResult.count },
      };
      expect(
        await cw20TokenController.getCw20Tokens({} as any, {} as any),
      ).toEqual(expectResult);
    });
  });

  describe('getPriceById', () => {
    const price = 5;
    beforeEach(() => {
      jest.spyOn(spyService, 'getPriceById').mockResolvedValue(price);
    });
    it('should call getCw20Tokens', async () => {
      await cw20TokenController.getPriceById({} as any, '');
      expect(spyService.getPriceById).toHaveBeenCalled();
    });

    it('should return price info', async () => {
      const expectResult = {
        data: price,
        meta: {},
      };
      expect(await cw20TokenController.getPriceById({} as any, '')).toEqual(
        expectResult,
      );
    });
  });

  describe('getTotalAssetByAccountAddress', () => {
    const price = 5;
    beforeEach(() => {
      jest
        .spyOn(spyService, 'getTotalAssetByAccountAddress')
        .mockResolvedValue(price);
    });
    it('should call getCw20Tokens', async () => {
      await cw20TokenController.getTotalAssetByAccountAddress({} as any, '');
      expect(spyService.getTotalAssetByAccountAddress).toHaveBeenCalled();
    });

    it('should return total asset of coins and tokens', async () => {
      const expectResult = {
        data: price,
        meta: {},
      };
      expect(
        await cw20TokenController.getTotalAssetByAccountAddress({} as any, ''),
      ).toEqual(expectResult);
    });
  });
});
