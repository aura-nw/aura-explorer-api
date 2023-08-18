import { Test, TestingModule } from '@nestjs/testing';
import { ContractController } from '../../../../components/contract/controllers/contract.controller';
import { AkcLogger, RequestContext } from '../../../../shared';
import { ContractService } from '../../../../components/contract/services/contract.service';
import { BadRequestException, CacheModule } from '@nestjs/common';
import { VerifyCodeIdParamsDto } from '../../../../components/contract/dtos/verify-code-id-params.dto';
import { VerifyCodeStepOutputDto } from '../../../../components/contract/dtos/verify-code-step-output.dto';

describe('ContractController', () => {
  let contractController: ContractController;
  let contractService: ContractService;
  const ctxMock = {} as unknown as RequestContext;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContractController,
        AkcLogger,
        {
          provide: ContractService,
          useValue: {
            getCodeDetail: jest.fn(),
            verifyCodeId: jest.fn(),
            getVerifyCodeStep: jest.fn(),
            verifyContractStatus: jest.fn(),
            getCW4973Detail: jest.fn(),
          },
        },
      ],
      imports: [CacheModule.register({})],
    }).compile();

    contractController = module.get<ContractController>(ContractController);
    contractService = module.get<ContractService>(ContractService);
  });

  it('should be defined', () => {
    expect(contractController).toBeDefined();
    expect(contractService).toBeDefined();
  });

  describe('verifyCodeId', () => {
    const paramMock: VerifyCodeIdParamsDto = {
      code_id: 1,
      commit: '',
      url: '',
      compiler_version: '',
      wasm_file: '',
    };

    it('should call service verifyCodeId', async () => {
      await contractController.verifyCodeId(ctxMock, paramMock);
      expect(contractService.verifyCodeId).toHaveBeenCalled();
    });

    it('should return a successful response', async () => {
      const verifyCodeIdResult = {};
      jest
        .spyOn(contractService, 'verifyCodeId')
        .mockImplementation(() => Promise.resolve(verifyCodeIdResult));
      const expectResult = {
        data: verifyCodeIdResult,
        meta: {},
      };
      const response = await contractController.verifyCodeId(
        ctxMock,
        paramMock,
      );
      expect(response).toEqual(expectResult);
    });

    it('should throw an error', async () => {
      jest.spyOn(contractService, 'verifyCodeId').mockImplementationOnce(() => {
        throw new BadRequestException();
      });
      try {
        await contractController.verifyCodeId(ctxMock, paramMock);
      } catch (err) {
        expect(err.response.statusCode).toBe(400);
        expect(err.response.message).toBe('Bad Request');
      }
    });
  });

  describe('getVerifyCodeStep', () => {
    it('should call service getVerifyCodeStep', async () => {
      await contractController.getVerifyCodeStep(ctxMock, 1);
      expect(contractService.getVerifyCodeStep).toHaveBeenCalled();
    });

    it('should return a successful response', async () => {
      const data: VerifyCodeStepOutputDto[] = [
        {
          code_id: 0,
          check_id: 0,
          check_name: '',
          result: '',
          msg_code: '',
        },
      ];
      jest
        .spyOn(contractService, 'getVerifyCodeStep')
        .mockResolvedValue({ data, error: {} });

      const expectResult = { data, error: {} };
      const response = await contractController.getVerifyCodeStep(ctxMock, 1);
      expect(response).toEqual(expectResult);
    });

    it('should throw an error', async () => {
      jest
        .spyOn(contractService, 'getVerifyCodeStep')
        .mockImplementationOnce(() => {
          throw new BadRequestException();
        });
      try {
        await contractController.getVerifyCodeStep(ctxMock, 1);
      } catch (err) {
        expect(err.response.statusCode).toBe(400);
        expect(err.response.message).toBe('Bad Request');
      }
    });
  });

  describe('verifyContractStatus', () => {
    it('should call service verifyContractStatus', async () => {
      await contractController.verifyContractStatus(ctxMock, 1);
      expect(contractService.verifyContractStatus).toHaveBeenCalled();
    });

    it('should return a successful response', async () => {
      jest
        .spyOn(contractService, 'verifyContractStatus')
        .mockResolvedValue({ codeId: 1, status: 'test' });

      const expectResult = { data: { codeId: 1, status: 'test' }, meta: {} };
      const response = await contractController.verifyContractStatus(
        ctxMock,
        1,
      );
      expect(response).toEqual(expectResult);
    });

    it('should throw an error', async () => {
      jest
        .spyOn(contractService, 'verifyContractStatus')
        .mockImplementationOnce(() => {
          throw new BadRequestException();
        });
      try {
        await contractController.verifyContractStatus(ctxMock, 1);
      } catch (err) {
        expect(err.response.statusCode).toBe(400);
        expect(err.response.message).toBe('Bad Request');
      }
    });
  });

  describe('getCW4973Detail', () => {
    it('should call service getCW4973Detail', async () => {
      await contractController.getCW4973Detail(ctxMock, 'test', 'test');
      expect(contractService.getCW4973Detail).toHaveBeenCalled();
    });

    const nft = {
      id: '',
      contract_address: '',
      token_id: '',
      token_uri: '',
      token_name: '',
      token_name_ipfs: '',
      animation_url: '',
      token_img: '',
      img_type: '',
      receiver_address: '',
      status: '',
      picked: '',
      signature: '',
      pub_key: '',
      minter_address: '',
      type: 'CW4973',
      ipfs: '',
    };

    it('should return a successful response', async () => {
      jest.spyOn(contractService, 'getCW4973Detail').mockResolvedValue(nft);

      const expectResult = { data: nft, meta: {} };
      const response = await contractController.getCW4973Detail(
        ctxMock,
        'test',
        'test',
      );
      expect(response).toEqual(expectResult);
    });

    it('should throw an error', async () => {
      jest
        .spyOn(contractService, 'getCW4973Detail')
        .mockImplementationOnce(() => {
          throw new BadRequestException();
        });
      try {
        await contractController.getCW4973Detail(ctxMock, 'test', 'test');
      } catch (err) {
        expect(err.response.statusCode).toBe(400);
        expect(err.response.message).toBe('Bad Request');
      }
    });
  });
});
