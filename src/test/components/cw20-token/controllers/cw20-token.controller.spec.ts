import { Test, TestingModule } from '@nestjs/testing';
import { Cw20TokenController } from '../../../../components/cw20-token/controllers/cw20-token.controller';
import { Cw20TokenService } from '../../../../components/cw20-token/services/cw20-token.service';
import { AkcLogger, RequestContext } from '../../../../shared';
import { CacheModule } from '@nestjs/common';
import { Cw20TokenMarketParamsDto } from 'src/components/cw20-token/dtos/cw20-token-market-params.dto';

describe('Cw20TokenController', () => {
  let cw20TokenController: Cw20TokenController;
  let cw20TokenService: Cw20TokenService;
  const ctxMock = {} as unknown as RequestContext;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        Cw20TokenController,
        AkcLogger,
        {
          provide: Cw20TokenService,
          useValue: {
            getTokenMarket: jest.fn(),
          },
        },
      ],
      imports: [CacheModule.register({})],
    }).compile();

    cw20TokenController = module.get<Cw20TokenController>(Cw20TokenController);
    cw20TokenService = module.get<Cw20TokenService>(Cw20TokenService);
  });

  it('should be defined', () => {
    expect(cw20TokenController).toBeDefined();
    expect(cw20TokenService).toBeDefined();
  });

  describe('getTokenMarket', () => {
    const paramMock: Cw20TokenMarketParamsDto = {
      contractAddress: '',
      onlyIbc: 'false',
    };

    it('should call service getTokenMarket', async () => {
      await cw20TokenController.getTokenMarket(ctxMock, paramMock);
      expect(cw20TokenService.getTokenMarket).toHaveBeenCalled();
    });
  });
});
