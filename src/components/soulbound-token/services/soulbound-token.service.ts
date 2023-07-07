import { Body, Injectable } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import {
  AkcLogger,
  CW4973_CONTRACT,
  ERROR_MAP,
  RequestContext,
  SoulboundToken,
  SOULBOUND_PICKED_TOKEN,
  SOULBOUND_TOKEN_STATUS,
  INDEXER_API_V2,
} from '../../../shared';
import { CreateSoulboundTokenParamsDto } from '../dtos/create-soulbound-token-params.dto';
import { PickedNftParasDto } from '../dtos/picked-nft-paras.dto';
import { SoulboundContractOutputDto } from '../dtos/soulbound-contract-output.dto';
import { SoulboundContractParasDto } from '../dtos/soulbound-contract-paras.dto';
import { TokenOutputDto } from '../dtos/token-output.dto';
import { TokenParasDto } from '../dtos/token-paras.dto';
import { UpdateSoulboundTokenParamsDto } from '../dtos/update-soulbound-token-params.dto';
import { SoulboundTokenRepository } from '../repositories/soulbound-token.repository';
import { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate';
import { HttpService } from '@nestjs/axios';
import console from 'console';
import { sha256 } from 'js-sha256';
import { lastValueFrom, retry, timeout } from 'rxjs';
import * as appConfig from '../../../shared/configs/configuration';
import { ContractUtil } from '../../../shared/utils/contract.util';
import { ServiceUtil } from '../../../shared/utils/service.util';
import { PickedTokenParasDto } from '../dtos/picked-token-paras.dto';
import { ReceiverTokenParasDto } from '../dtos/receive-token-paras.dto';
import { TokenByReceiverAddressOutput } from '../dtos/token-by-receiver-address-output.dto';
import { TokenPickedByAddressOutput } from '../dtos/token-picked-by-address-output.dto';
import * as util from 'util';
import { RedisUtil } from '../../../shared/utils/redis.util';
import { SoulboundWhiteListRepository } from '../repositories/soulbound-white-list.repository';
import { TokenUpdatedParasDto } from '../dtos/token-updated-paras.dto';
import { SoulboundRejectListRepository } from '../repositories/soulbound-reject-list.repository';

@Injectable()
export class SoulboundTokenService {
  private appParams: any;
  private chainId: string;
  private rpc: string;
  private ioRedis: any;
  private channel: string;
  private chainDB;

  constructor(
    private readonly logger: AkcLogger,
    private soulboundTokenRepos: SoulboundTokenRepository,
    private soulboundWhiteListRepos: SoulboundWhiteListRepository,
    private SoulboundRejectListRepos: SoulboundRejectListRepository,
    private contractUtil: ContractUtil,
    private serviceUtil: ServiceUtil,
    private httpService: HttpService,
    private redisUtil: RedisUtil,
  ) {
    this.appParams = appConfig.default();
    this.chainId = this.appParams.indexer.chainId;
    this.rpc = this.appParams.node.rpc;
    this.ioRedis = this.redisUtil.getIoRedis();
    this.channel = this.appParams.cacheManagement.redis.channel;
    this.chainDB = this.appParams.indexerV2.chainDB;
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

    const abtAttributes = `minter
      smart_contract {
        address
      }`;

    const variables: any = {
      limit: req.limit,
      offset: req.offset,
      minter: req.minterAddress,
      address: req?.keyword ? req?.keyword : null,
    };

    const graphqlQuery = {
      query: util.format(
        INDEXER_API_V2.GRAPH_QL.CW4973_TOKEN_BY_MINTER,
        this.chainDB,
        abtAttributes,
      ),
      variables: variables,
      operationName: INDEXER_API_V2.OPERATION_NAME.CW4973_TOKEN_BY_MINTER,
    };

    const response = (await this.serviceUtil.fetchDataFromGraphQL(graphqlQuery))
      .data[this.chainDB];

    const addresses = response?.cw721_contract?.map(
      (item) => item.smart_contract.address,
    );
    const results: SoulboundContractOutputDto[] = [];
    if (addresses.length > 0) {
      const status = await this.soulboundTokenRepos.countStatus(addresses);
      response?.cw721_contract?.forEach((item: any) => {
        let soulboundContract = new SoulboundContractOutputDto();
        let claimedQty = 0,
          unclaimedQty = 0;
        soulboundContract = { ...item };

        status
          ?.filter((f) => f.contract_address === item.smart_contract.address)
          ?.forEach((m) => {
            if (m.status === SOULBOUND_TOKEN_STATUS.EQUIPPED) {
              claimedQty = Number(m.quantity) || 0;
            } else {
              unclaimedQty += Number(m.quantity) || 0;
            }
          });

        soulboundContract.total = claimedQty + unclaimedQty;
        soulboundContract.claimed_qty = claimedQty;
        soulboundContract.unclaimed_qty = unclaimedQty;
        results.push(soulboundContract);
      });
    }
    return {
      contracts: results,
      count: response?.cw721_contract_aggregate.aggregate.count,
    };
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

    const { tokens, count } = await this.soulboundTokenRepos.getPickedToken(
      req.receiverAddress,
      req.limit,
    );
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
    const receiver_address = req.receiver_address.trim();
    if (receiver_address === address) {
      return {
        code: ERROR_MAP.TAKE_SELF_TOKEN.Code,
        message: ERROR_MAP.TAKE_SELF_TOKEN.Message,
      };
    }

    const entity = new SoulboundToken();

    const response = await this.getCW4973Contract({
      minter: address,
      address: req.contract_address,
    });

    if (response?.length > 0) {
      const ipfs = await lastValueFrom(
        this.httpService
          .get(this.contractUtil.transform(req.token_uri))
          .pipe(timeout(8000), retry(5)),
      )
        .then((rs) => rs.data)
        .catch(() => {
          return null;
        });

      if (!ipfs || !ipfs.hasOwnProperty('image')) {
        return {
          code: ERROR_MAP.TOKEN_URI_INVALID.Code,
          message: ERROR_MAP.TOKEN_URI_INVALID.Message,
        };
      }

      let contentType;
      const imgUrl = !!ipfs.animation_url ? ipfs.animation_url : ipfs.image;
      if (imgUrl) {
        contentType = await lastValueFrom(
          this.httpService
            .get(this.contractUtil.transform(imgUrl))
            .pipe(timeout(18000), retry(5)),
        )
          .then((rs) => rs?.headers['content-type'])
          .catch(() => {
            return null;
          });

        if (!contentType) {
          return {
            code: ERROR_MAP.VERIFY_IMG_TYPE.Code,
            message: ERROR_MAP.VERIFY_IMG_TYPE.Message,
          };
        }
      }

      entity.contract_address = response[0].smart_contract.address;
      entity.status = SOULBOUND_TOKEN_STATUS.UNCLAIM;
      entity.receiver_address = receiver_address;
      entity.token_uri = req.token_uri;
      entity.signature = req.signature;
      entity.pub_key = req.pubKey;
      entity.token_img = ipfs.image;
      entity.token_name = ipfs.name;
      entity.ipfs = JSON.stringify(ipfs);
      entity.img_type = contentType;
      entity.is_notify = true;
      entity.animation_url = ipfs.animation_url;
      entity.token_id = this.createTokenId(
        this.chainId,
        receiver_address,
        response[0].minter,
        req.token_uri,
      );
      try {
        const result = await this.soulboundTokenRepos.save(entity);
        // Send notfiy after create abt successfully
        this.ioRedis.publish(
          this.channel,
          JSON.stringify({
            ReceiverAddress: receiver_address,
          }),
        );
        return { data: result, meta: {} };
      } catch (err) {
        this.logger.error(
          ctx,
          `Class ${SoulboundTokenService.name} call ${this.create.name} error ${err?.code} method error: ${err?.stack}`,
        );
        if (err?.code === 'ER_DUP_ENTRY') {
          return {
            code: ERROR_MAP.ER_DUP_ENTRY.Code,
            message: ERROR_MAP.ER_DUP_ENTRY.Message,
          };
        }
      }
    } else {
      return {
        code: ERROR_MAP.MINTER_OR_CONTRACT_ADDRESS_INVALID.Code,
        message: ERROR_MAP.MINTER_OR_CONTRACT_ADDRESS_INVALID.Message,
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
      where: { token_id: req.id, contract_address: req.contractAddress },
    });
    if (entity) {
      if (entity.receiver_address === address) {
        entity.status = SOULBOUND_TOKEN_STATUS.PENDING;
        entity.signature = req.signature;
        entity.pub_key = req.pubKey;
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
   * count notify of soulbound token
   * @param ctx
   * @param req
   * @returns
   */
  async getNotifyByReceiverAddress(
    ctx: RequestContext,
    receiverAddress: string,
  ) {
    this.logger.log(
      ctx,
      `============== ${this.getNotifyByReceiverAddress.name} was called with paras: ${receiverAddress}! ==============`,
    );

    const result = await this.soulboundTokenRepos.count({
      where: {
        receiver_address: receiverAddress,
        is_notify: true,
        status: SOULBOUND_TOKEN_STATUS.UNCLAIM,
      },
    });

    return { notify: result };
  }

  /**
   * Update notify of soulbound token
   * @param ctx
   * @param req
   * @returns
   */
  async updateNotify(ctx: RequestContext, @Body() req: TokenUpdatedParasDto) {
    this.logger.log(
      ctx,
      `============== ${
        this.updateNotify.name
      } was called with paras: ${JSON.stringify(req)}! ==============`,
    );

    const result = await this.soulboundTokenRepos.updateNotify(
      req.tokenId,
      req.contractAddress,
    );

    return { data: result, meta: {} };
  }

  /**
   * Update notify of soulbound token
   * @param ctx
   * @param req
   * @returns
   */
  async rejectToken(ctx: RequestContext, @Body() req: TokenUpdatedParasDto) {
    this.logger.log(
      ctx,
      `============== ${
        this.rejectToken.name
      } was called with paras: ${JSON.stringify(req)}! ==============`,
    );

    let allContract;
    // Case: reject all abt form this minter address
    if (req.rejectAll) {
      const smartcontract = await this.getCW4973Contract({
        address: req.contractAddress,
      });

      if (smartcontract.length > 0) {
        // Find all contract with this minter address
        allContract = await this.getCW4973Contract({
          minter: smartcontract[0].minter,
        });

        const rejectToken = {
          account_address: req.receiverAddress,
          reject_address: smartcontract[0].minter,
        };
        // add this minter address to block list.
        await this.SoulboundRejectListRepos.save(rejectToken);
      }
    }

    // Filter contract address to update status.
    const contractAddress = allContract?.map(
      (item) => item.smart_contract.address,
    ) || [req.contractAddress];

    const result = await this.soulboundTokenRepos.updateRejectStatus(
      req.tokenId,
      contractAddress,
      req.receiverAddress,
      req.rejectAll,
    );

    return { data: result, meta: {} };
  }

  /**
   * Update notify of soulbound token
   * @param ctx
   * @param receiverAddress
   * @param minterAddress
   * @returns
   */
  async checkRejectToken(
    ctx: RequestContext,
    receiverAddress: string,
    minterAddress: string,
  ) {
    this.logger.log(ctx, `============== ${this.checkRejectToken.name}`);
    const receiver_address = receiverAddress.trim();
    if (receiver_address === minterAddress) {
      return {
        code: ERROR_MAP.TAKE_SELF_TOKEN.Code,
        message: ERROR_MAP.TAKE_SELF_TOKEN.Message,
      };
    }
    const validAddress = await this.SoulboundRejectListRepos.count({
      where: {
        account_address: receiver_address,
        reject_address: minterAddress,
      },
    });
    if (validAddress > 0) {
      return {
        code: ERROR_MAP.REJECT_ABT_TOKEN.Code,
        message: ERROR_MAP.REJECT_ABT_TOKEN.Message,
      };
    }
  }

  /**
   * Get white list account soulbound
   * @param ctx
   * @returns
   */
  async getSoulboundWhiteList(ctx: RequestContext) {
    this.logger.log(
      ctx,
      `============== ${this.getSoulboundWhiteList.name} was called! ==============`,
    );

    const whitelist = await this.soulboundWhiteListRepos.find();

    return whitelist;
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
      where: { token_id: req.id, contract_address: req.contractAddress },
    });

    if (entity) {
      const numOfPickedToken = await this.soulboundTokenRepos.count({
        where: { receiver_address: entity.receiver_address, picked: true },
      });
      if (numOfPickedToken >= SOULBOUND_PICKED_TOKEN.MAX && req.picked) {
        return {
          code: ERROR_MAP.PICKED_TOKEN_OVERSIZE.Code,
          message: ERROR_MAP.PICKED_TOKEN_OVERSIZE.Message,
        };
      }
      const result = await SigningCosmWasmClient.connect(this.rpc)
        .then((client) =>
          client.queryContractSmart(entity.contract_address, {
            nft_info: {
              token_id: entity.token_id,
            },
          }),
        )
        .then(async () => {
          if (address === entity.receiver_address) {
            const result = await this.soulboundTokenRepos.update(entity.id, {
              picked: req.picked,
            });
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
      return result;
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
      const message: string = this.createMessageToSign(
        chainID,
        active,
        passive,
        uri,
      );
      return sha256(message);
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
    const message =
      CW4973_CONTRACT.AGREEMENT + chainID + active + passive + uri;
    const doc: any = {
      account_number: '0',
      chain_id: '',
      fee: {
        amount: [],
        gas: '0',
      },
      memo: '',
      msgs: [
        {
          type: 'sign/MsgSignData',
          value: {
            data: Buffer.from(message, 'utf8').toString('base64'),
            signer: String(passive),
          },
        },
      ],
      sequence: '0',
    };
    return JSON.stringify(doc);
  }

  private async getCW4973Contract(variables) {
    const abtAttributes = `minter
      smart_contract {
        address
      }`;

    const graphqlQuery = {
      query: util.format(
        INDEXER_API_V2.GRAPH_QL.CW4973_CONTRACT,
        this.chainDB,
        abtAttributes,
      ),
      variables: variables,
      operationName: INDEXER_API_V2.OPERATION_NAME.CW4973_CONTRACT,
    };

    return (await this.serviceUtil.fetchDataFromGraphQL(graphqlQuery)).data[
      this.chainDB
    ]['cw721_contract'];
  }
}
