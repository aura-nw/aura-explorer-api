import { Body, Injectable } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import {
  AkcLogger,
  AURA_INFO,
  CW4973_CONTRACT,
  ERROR_MAP,
  LENGTH,
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
import * as appConfig from '../../../shared/configs/configuration';
import { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate';
import { ContractUtil } from '../../../shared/utils/contract.util';
import console from 'console';
import { sha256 } from '@cosmjs/crypto';
import { serializeSignDoc } from '@cosmjs/amino';
import { TokenByReceiverAddressOutput } from '../dtos/token-by-receiver-address-output.dto';
import { TokenPickedByAddressOutput } from '../dtos/token-picked-by-address-output.dto';
import { PickedTokenParasDto } from '../dtos/picked-token-paras.dto';
import { ReceiverTokenParasDto } from '../dtos/receive-token-paras.dto';
import { ServiceUtil } from '../../../shared/utils/service.util';
@Injectable()
export class SoulboundTokenService {
  private appParams: any;
  private chainId: string;
  private rpc: string;

  constructor(
    private readonly logger: AkcLogger,
    private soulboundTokenRepos: SoulboundTokenRepository,
    private smartContractRepos: SmartContractRepository,
    private contractUtil: ContractUtil,
    private serviceUtil: ServiceUtil,
  ) {
    this.appParams = appConfig.default();
    this.chainId = this.appParams.indexer.chainId;
    this.rpc = this.appParams.node.rpc;
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
        req.keyword,
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
          ?.filter((f) => f.contract_address === item.contract_address)
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
      req.keyword,
      req.status,
      req.limit,
      req.offset,
    );
    const data = plainToClass(TokenOutputDto, tokens, {
      excludeExtraneousValues: true,
    });
    return { data, count };
  }

  /**
   * Get list tokens by minter address and contract address
   * @param ctx
   * @param req
   * @returns
   */
  async getTokensDetail(ctx: RequestContext, tokenId: string) {
    this.logger.log(
      ctx,
      `============== ${
        this.getTokens.name
      } was called with paras: tokenId=${JSON.stringify(
        tokenId,
      )}! ==============`,
    );
    const token = await this.soulboundTokenRepos.findOne({
      where: { token_id: tokenId },
    });

    const addresses = token?.contract_address || '';

    const contract = await this.smartContractRepos.findOne({
      where: { contract_address: addresses },
    });

    const ipfs = await this.serviceUtil.getDataAPI(token?.token_uri, '', ctx);

    if (!ipfs) {
      return {
        code: ERROR_MAP.TOKEN_URI_INVALID.Code,
        message: ERROR_MAP.TOKEN_URI_INVALID.Message,
      };
    }

    return {
      id: token?.id || '',
      contract_address: addresses,
      token_id: token?.token_id || '',
      token_uri: token?.token_uri || '',
      token_name: contract?.token_name || '',
      receiver_address: token?.receiver_address || '',
      status: token?.status || '',
      picked: token?.picked || '',
      signature: token?.signature || '',
      minter_address: contract?.minter_address || '',
      description: contract?.description || '',
      ipfs,
    };
  }

  /**
   * Get list tokens by receiver address
   * @param ctx
   * @param receiverAddress
   * @returns
   */
  async getTokenByReceiverAddress(
    ctx: RequestContext,
    req: ReceiverTokenParasDto,
  ) {
    this.logger.log(
      ctx,
      `============== ${
        this.getTokenByReceiverAddress.name
      } was called with paras: ${JSON.stringify(req)}! ==============`,
    );

    const { tokens, count } =
      await this.soulboundTokenRepos.getTokenByReceiverAddress(
        req.receiverAddress,
        req.isEquipToken,
        req.keyword,
        req.limit,
        req.offset,
      );

    const data = plainToClass(TokenByReceiverAddressOutput, tokens, {
      excludeExtraneousValues: true,
    });
    return { data, count: count };
  }

  async getTokenPickedByAddress(ctx: RequestContext, req: PickedTokenParasDto) {
    this.logger.log(
      ctx,
      `============== ${
        this.getTokenPickedByAddress.name
      } was called with paras: ${JSON.stringify(req)}! ==============`,
    );
    const [tokens, count] = await this.soulboundTokenRepos.findAndCount({
      where: {
        receiver_address: req.receiverAddress,
      },
      take: req.limit,
      order: {
        picked: 'DESC',
        created_at: 'ASC',
      },
    });
    const data = plainToClass(TokenPickedByAddressOutput, tokens, {
      excludeExtraneousValues: true,
    });
    return { data, count: count };
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
    // Verify signature
    const address = await this.contractUtil.verifySignatue(
      req.signature,
      req.msg,
      req.pubKey,
    );
    if (!address) {
      return {
        code: ERROR_MAP.YOUR_ADDRESS_INVALID.Code,
        message: ERROR_MAP.YOUR_ADDRESS_INVALID.Message,
      };
    }

    const entity = new SoulboundToken();
    const contract = await this.smartContractRepos.findOne({
      where: {
        contract_address: req.contract_address,
        minter_address: address,
      },
    });
    if (contract) {
      const isReceiverAddress =
        contract.contract_address.startsWith(AURA_INFO.CONTRACT_ADDRESS) &&
        contract.contract_address.length === LENGTH.CONTRACT_ADDRESS;

      if (!isReceiverAddress) {
        return {
          code: ERROR_MAP.YOUR_ADDRESS_INVALID.Code,
          message: ERROR_MAP.YOUR_ADDRESS_INVALID.Message,
        };
      }

      const ipfs = await this.serviceUtil.getDataAPI(req.token_uri, '', ctx);

      if (!ipfs) {
        return {
          code: ERROR_MAP.TOKEN_URI_INVALID.Code,
          message: ERROR_MAP.TOKEN_URI_INVALID.Message,
        };
      }

      entity.contract_address = contract.contract_address;
      entity.status = SOULBOUND_TOKEN_STATUS.UNCLAIM;
      entity.receiver_address = req.receiver_address;
      entity.token_uri = req.token_uri;
      entity.signature = req.signature;
      entity.token_img = ipfs.image;
      entity.token_id = this.createTokenId(
        this.chainId,
        contract.minter_address,
        req.receiver_address,
        req.token_uri,
      );
      try {
        const result = await this.soulboundTokenRepos.save(entity);
        return { data: result, meta: {} };
      } catch (err) {
        this.logger.error(
          ctx,
          `Class ${SoulboundTokenService.name} call ${this.create.name} method error: ${err.stack}`,
        );
        throw err;
      }
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

    // Verify signature
    const address = await this.contractUtil.verifySignatue(
      req.signature,
      req.msg,
      req.pubKey,
    );
    if (!address) {
      return {
        code: ERROR_MAP.YOUR_ADDRESS_INVALID.Code,
        message: ERROR_MAP.YOUR_ADDRESS_INVALID.Message,
      };
    }

    const entity = await this.soulboundTokenRepos.findOne({
      where: { token_id: req.id },
    });
    if (entity) {
      if (entity.receiver_address === address) {
        entity.status = SOULBOUND_TOKEN_STATUS.PENDING;
        entity.signature = req.signature;
        const result = await this.soulboundTokenRepos.update(entity.id, entity);
        return { data: result, meta: {} };
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

    // Verify signature
    const address = await this.contractUtil.verifySignatue(
      req.signature,
      req.msg,
      req.pubKey,
    );
    if (!address) {
      return {
        code: ERROR_MAP.YOUR_ADDRESS_INVALID.Code,
        message: ERROR_MAP.YOUR_ADDRESS_INVALID.Message,
      };
    }

    const entity = await this.soulboundTokenRepos.findOne({
      where: { token_id: req.id },
    });
    if (entity) {
      SigningCosmWasmClient.connect(this.rpc)
        .then((client) =>
          client.queryContractSmart(entity.contract_address, {
            nft_info: {
              token_id: entity.token_id,
            },
          }),
        )
        .then(async (config) => {
          if (address === entity.receiver_address) {
            entity.picked = req.picked;
            const result = await this.soulboundTokenRepos.update(
              entity.id,
              entity,
            );
            return { data: result, meta: {} };
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

  /**
   * Create token Id
   * @param chainID
   * @param active
   * @param passive
   * @param uri
   * @returns
   */
  private createTokenId(
    chainID: string,
    active: string,
    passive: string,
    uri: string,
  ): string {
    try {
      const messgae: any = this.createMessageToSign(
        chainID,
        active,
        passive,
        uri,
      );
      const serialize = serializeSignDoc(messgae);
      const hash = sha256(serialize);
      const tokenId = Buffer.from(hash).toString('base64');

      return tokenId;
    } catch (err) {
      console.log(err);
    }
  }

  /**
   * Create message sign
   * @param chainID
   * @param active
   * @param passive
   * @param uri
   * @returns
   */
  private createMessageToSign(
    chainID: string,
    active: string,
    passive: string,
    uri: string,
  ) {
    const message = CW4973_CONTRACT.AGREEMENT + active + passive + uri;
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
