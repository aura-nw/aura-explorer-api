import { Test, TestingModule } from '@nestjs/testing';
import { CacheModule } from '@nestjs/common';

import { AkcLogger } from '../../../../src/shared';
import { Cw721TokenController } from '../../../../src/components/cw721-token/controllers/cw721-token.controller';
import { Cw721TokenService } from '../../../../src/components/cw721-token/services/cw721-token.service';

describe('Cw721TokenController', () => {
  let spyService: Cw721TokenService;
  let cw721TokenController: Cw721TokenController;

  beforeEach(async () => {
    const Cw721TokenServiceProvider = {
      provide: Cw721TokenService,
      useFactory: () => ({
        getCw721Tokens: jest.fn(),
        getNftsByOwner: jest.fn(),
        getNftByContractAddressAndTokenId: jest.fn(),
      }),
    };
    const app: TestingModule = await Test.createTestingModule({
      controllers: [Cw721TokenController],
      providers: [Cw721TokenServiceProvider, AkcLogger],
      imports: [CacheModule.register({})],
    }).compile();

    cw721TokenController = app.get<Cw721TokenController>(Cw721TokenController);
    spyService = app.get<Cw721TokenService>(Cw721TokenService);
  });

  describe('getCw721Tokens', () => {
    const serviceResult = {
      tokens: [{ name: 'aura-network', symbol: 'aura', num_tokens: 10 }],
      count: 1,
    };
    beforeEach(() => {
      jest.spyOn(spyService, 'getCw721Tokens').mockResolvedValue(serviceResult);
    });
    it('should call service getCw721Tokens', async () => {
      cw721TokenController.getCw721Tokens({} as any, {} as any);
      expect(spyService.getCw721Tokens).toHaveBeenCalled();
    });
    it('should retrieve CW721 tokens info', async () => {
      const expectResult = {
        data: serviceResult.tokens,
        meta: { count: serviceResult.count },
      };
      expect(
        await cw721TokenController.getCw721Tokens({} as any, {} as any),
      ).toEqual(expectResult);
    });
  });

  describe('getNftsByOwner', () => {
    const serviceResult = {
      tokens: [{ name: 'abc', symbol: 'abc', num_tokens: 10 }],
      count: 1,
    };
    beforeEach(() => {
      jest.spyOn(spyService, 'getNftsByOwner').mockResolvedValue(serviceResult);
    });
    it('should call service getNftsByOwner', async () => {
      cw721TokenController.getNftsByOwner({} as any, {} as any);
      expect(spyService.getNftsByOwner).toHaveBeenCalled();
    });
    it('should retrieve getNftsByOwner info', async () => {
      const expectResult = {
        data: serviceResult.tokens,
        meta: { count: serviceResult.count },
      };
      expect(
        await cw721TokenController.getNftsByOwner({} as any, {} as any),
      ).toEqual(expectResult);
    });
  });

  describe('getNftByContractAddressAndTokenId', () => {
    const serviceResult = {
      name: 'abc',
      symbol: 'abc',
      creator: 'creator',
      owner: '',
    };
    beforeEach(() => {
      jest
        .spyOn(spyService, 'getNftByContractAddressAndTokenId')
        .mockResolvedValue(serviceResult);
    });
    it('should call service getNftByContractAddressAndTokenId', async () => {
      cw721TokenController.getNftByContractAddressAndTokenId({} as any, '', '');
      expect(spyService.getNftByContractAddressAndTokenId).toHaveBeenCalled();
    });
    it('should retrieve Nft info', async () => {
      const expectResult = {
        data: serviceResult,
        meta: {},
      };
      expect(
        await cw721TokenController.getNftByContractAddressAndTokenId(
          {} as any,
          '',
          '',
        ),
      ).toEqual(expectResult);
    });
  });
});
