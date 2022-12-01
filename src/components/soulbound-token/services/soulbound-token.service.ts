import { Body, Injectable } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import {
  AkcLogger,
  ERROR_MAP,
  RequestContext,
  SoulboundToken,
  SOULBOUND_TOKEN_STATUS,
} from '../../../shared';
import { SmartContractRepository } from '../../contract/repositories/smart-contract.repository';
import { CreateSoulboundTokenParamsDto } from '../dtos/create-soulbound-token-params.dto';
import { PickedNftParasDto } from '../dtos/picked-nft-paras.dto';
import { SoulboundContractOutputDto } from '../dtos/soulbound-contract-output.dto';
import { SoulboundContractParasDto } from '../dtos/soulbound-contract-paras.dto';
import { TokenOutputDto } from '../dtos/token-output.dto';
import { TokenParasDto } from '../dtos/token-paras.dto';
import { UpdateSoulboundTokenParamsDto } from '../dtos/update-soulbound-token-params.dto';
import { SoulboundTokenRepository } from '../repositories/soulbound-token.repository';

import * as amino from '@cosmjs/amino';
import { sha256 } from 'js-sha256';
import * as appConfig from '../../../shared/configs/configuration';
import { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate';
@Injectable()
export class SoulboundTokenService {
  private appParams: any;
  private chainId: string;

  constructor(
    private readonly logger: AkcLogger,
    private soulboundTokenRepos: SoulboundTokenRepository,
    private smartContractRepos: SmartContractRepository,
  ) {
    this.appParams = appConfig.default();
    this.chainId = this.appParams.indexer.chainId;
  }

  /**
   * Get data contract soulbound token
   * @param ctx
   * @param req
   * @returns
   */
  async getContracts(ctx: RequestContext, req: SoulboundContractParasDto) {
    this.logger.log(
      ctx,
      `============== ${
        this.getContracts.name
      } was called with paras: ${JSON.stringify(req)}! ==============`,
    );
    const { contracts, count } =
      await this.smartContractRepos.getContractByMinter(
        req.minterAddress,
        req.limit,
        req.offset,
      );
    const addresses = contracts?.map((item) => item.contract_address);
    const results: SoulboundContractOutputDto[] = [];
    if (addresses.length > 0) {
      const status = await this.soulboundTokenRepos.countStatus(addresses);
      contracts.forEach((item: any) => {
        let soulboundContract = new SoulboundContractOutputDto();
        let claimedQty = 0,
          unclaimedQty = 0;
        soulboundContract = { ...item };

        status
          ?.find((f) => f.contract_address === item.contract_address)
          ?.forEach((m) => {
            if (m.status === SOULBOUND_TOKEN_STATUS.EQUIPPED) {
              claimedQty = Number(m.quanity) || 0;
            } else {
              unclaimedQty += Number(m.quanity) || 0;
            }
          });

        soulboundContract.total = claimedQty + unclaimedQty;
        soulboundContract.claimed_qty = claimedQty;
        soulboundContract.unclaimed_qty = unclaimedQty;
        results.push(soulboundContract);
      });
    }
    return { contracts: results, count };
  }

  /**
   * Get list tokens by minter address and contract address
   * @param ctx
   * @param req
   * @returns
   */
  async getTokens(ctx: RequestContext, req: TokenParasDto) {
    this.logger.log(
      ctx,
      `============== ${
        this.getTokens.name
      } was called with paras: ${JSON.stringify(req)}! ==============`,
    );
    const { tokens, count } = await this.soulboundTokenRepos.getTokens(
      req.minterAddress,
      req.contractAddress,
      req.limit,
      req.offset,
    );
    const data = plainToClass(TokenOutputDto, tokens, {
      excludeExtraneousValues: true,
    });
    return { data, count };
  }

  /**
   * Create token of Soulbound contract which user can clain or mint token
   * @param ctx
   * @param req
   * @returns
   */
  async create(
    ctx: RequestContext,
    @Body() req: CreateSoulboundTokenParamsDto,
  ) {
    this.logger.log(
      ctx,
      `============== ${
        this.create.name
      } was called with paras: ${JSON.stringify(req)}! ==============`,
    );
    const entity = new SoulboundToken();
    const contract = await this.smartContractRepos.findOne({
      where: {
        contract_address: req.contract_address,
        minter_address: req.attestor_address,
      },
    });
    if (contract) {
      entity.contract_address = contract.contract_address;
      entity.status = SOULBOUND_TOKEN_STATUS.UNCLAIM;
      entity.receiver_address = req.receiver_address;
      entity.token_uri = req.token_uri;
      entity.token_id = this.createTokenId(
        this.chainId,
        contract.minter_address,
        req.receiver_address,
        req.token_uri,
      );

      return await this.soulboundTokenRepos.save(entity);
    } else {
      return {
        Code: ERROR_MAP.MINTER_OR_CONTRACT_ADDRESS_INVALID.Code,
        Message: ERROR_MAP.MINTER_OR_CONTRACT_ADDRESS_INVALID.Message,
      };
    }
  }

  /**
   * Update status token of Soulbound contract
   * @param ctx
   * @param req
   * @returns
   */
  async update(
    ctx: RequestContext,
    @Body() req: UpdateSoulboundTokenParamsDto,
  ) {
    this.logger.log(
      ctx,
      `============== ${
        this.update.name
      } was called with paras: ${JSON.stringify(req)}! ==============`,
    );
    const entity = await this.soulboundTokenRepos.findOne(req.id);
    if (entity) {
      if (entity.receiver_address === req.address) {
        entity.status = SOULBOUND_TOKEN_STATUS.PENDING;
        entity.signature = req.signature;
        const result = await this.soulboundTokenRepos.update(entity.id, entity);
        return { data: result, meta: 0 };
      } else {
        return {
          code: ERROR_MAP.YOUR_ADDRESS_INVALID.Code,
          message: ERROR_MAP.YOUR_ADDRESS_INVALID.Message,
        };
      }
    } else {
      return {
        code: ERROR_MAP.TOKEN_NOT_EXIST.Code,
        message: ERROR_MAP.TOKEN_NOT_EXIST.Message,
      };
    }
  }

  /**
   * Pick or Unpick nft of soulbound token
   * @param ctx
   * @param req
   * @returns
   */
  async pickedNft(ctx: RequestContext, @Body() req: PickedNftParasDto) {
    this.logger.log(
      ctx,
      `============== ${
        this.pickedNft.name
      } was called with paras: ${JSON.stringify(req)}! ==============`,
    );
    const entity = await this.soulboundTokenRepos.findOne(req.id);
    if (entity) {
      SigningCosmWasmClient.connect(this.chainId)
        .then((client) =>
          client.queryContractSmart(entity.contract_address, {
            owner_of: {
              token_id: entity.token_id,
            },
          }),
        )
        .then(async (config) => {
          if (req.address === entity.receiver_address) {
            entity.picked = req.picked;
            const result = await this.soulboundTokenRepos.update(
              entity.id,
              entity,
            );
            return { data: result, meta: 0 };
          }
        })
        .catch((err) => {
          this.logger.log(ctx, err.stack);
          return {
            code: ERROR_MAP.TOKEN_NOT_EXIST.Code,
            message: ERROR_MAP.TOKEN_NOT_EXIST.Message,
          };
        });
    } else {
      return {
        code: ERROR_MAP.TOKEN_NOT_EXIST.Code,
        message: ERROR_MAP.TOKEN_NOT_EXIST.Message,
      };
    }
  }

  private createTokenId(
    chainID: string,
    active: string,
    passive: string,
    uri: string,
  ): string {
    const messgae: any = this.createMessageToSign(
      chainID,
      active,
      passive,
      uri,
    );
    const hash: number[] = sha256.digest(messgae);
    let tokenId = '';
    hash.forEach((item) => {
      tokenId += String.fromCharCode(item);
    });
    return tokenId;
  }

  private createMessageToSign(
    chainID: string,
    active: string,
    passive: string,
    uri: string,
  ) {
    const AGREEMENT =
      'Agreement(address active,address passive,string tokenURI)';
    const message = AGREEMENT + active + passive + uri;
    const mess: any = {
      type: 'sign/MsgSignData',
      value: {
        signer: String(passive),
        data: String(message),
      },
    };
    const fee = {
      gas: '0',
      amount: [],
    };

    const messageToSign = amino.makeSignDoc(mess, fee, chainID, '', 0, 0);
    return messageToSign;
  }
}
