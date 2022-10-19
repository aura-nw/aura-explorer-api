import { Injectable } from '@nestjs/common';
import { find } from 'rxjs';
import { SmartContractRepository } from 'src/components/contract/repositories/smart-contract.repository';
import * as util from 'util';
import { AccountService } from '../../../components/account/services/account.service';
import { TokenContractRepository } from '../../../components/contract/repositories/token-contract.repository';
import {
  AkcLogger,
  AURA_INFO,
  CONTRACT_TYPE,
  INDEXER_API,
  RequestContext,
} from '../../../shared';
import * as appConfig from '../../../shared/configs/configuration';
import { RedisUtil } from '../../../shared/utils/redis.util';
import { ServiceUtil } from '../../../shared/utils/service.util';
import { AssetDto } from '../dtos/asset.dto';
import { Cw20TokenByOwnerParamsDto } from '../dtos/cw20-token-by-owner-params.dto';
import { Cw20TokenParamsDto } from '../dtos/cw20-token-params.dto';
@Injectable()
export class Cw20TokenService {
  private appParams;
  private indexerUrl;
  private indexerChainId;
  private denom;
  private minimalDenom;
  private decimals;
  private precisionDiv;
  private configUrl;

  constructor(
    private readonly logger: AkcLogger,
    private tokenContractRepository: TokenContractRepository,
    private smartContractRepository: SmartContractRepository,
    private serviceUtil: ServiceUtil,
    private redisUtil: RedisUtil,
    private accountService: AccountService,
  ) {
    this.logger.setContext(Cw20TokenService.name);
    this.appParams = appConfig.default();
    this.indexerUrl = this.appParams.indexer.url;
    this.indexerChainId = this.appParams.indexer.chainId;
    this.denom = this.appParams.chainInfo.coinDenom;
    this.minimalDenom = this.appParams.chainInfo.coinMinimalDenom;
    this.decimals = this.appParams.chainInfo.coinDecimals;
    this.precisionDiv = this.appParams.chainInfo.precisionDiv;
    this.configUrl = this.appParams.configUrl;
  }

  async getCw20Tokens(
    ctx: RequestContext,
    request: Cw20TokenParamsDto,
  ): Promise<any> {
    this.logger.log(ctx, `${this.getCw20Tokens.name} was called!`);
    const [tokens, count] = await this.tokenContractRepository.getDataTokens(
      CONTRACT_TYPE.CW20,
      request?.keyword,
      request.limit,
      request.offset,
    );

    return { tokens: tokens, count: count };
  }

  async getCw20TokensByOwner(
    ctx: RequestContext,
    request: Cw20TokenByOwnerParamsDto,
  ): Promise<any> {
    this.logger.log(ctx, `${this.getCw20TokensByOwner.name} was called!`);
    let result = [];
    //aura
    const assetDto = new AssetDto();
    assetDto.name = AURA_INFO.NAME;
    assetDto.symbol = this.denom;
    assetDto.image = AURA_INFO.IMAGE;
    assetDto.denom = this.minimalDenom;
    assetDto.decimals = this.decimals;
    //get balance
    const totalBalances = await this.accountService.getAccountDetailByAddress(
      ctx,
      request.account_address,
    );
    assetDto.balance = totalBalances ? totalBalances.total : '0';
    //get price of aura
    await this.redisUtil.connect();
    const data = await this.redisUtil.getValue(AURA_INFO.COIN_ID);
    if (data) {
      const priceData = JSON.parse(data);
      assetDto.price = priceData.current_price;
      assetDto.price_change_percentage_24h =
        priceData.price_change_percentage_24h;
      assetDto.max_total_supply = priceData.max_supply;
    }
    //get value
    assetDto.value = (
      Number(assetDto.balance) * Number(assetDto.price)
    ).toString();
    result.push(assetDto);

    //ibc
    const accountData = await this.serviceUtil.getDataAPI(
      `${this.indexerUrl}${util.format(
        INDEXER_API.ACCOUNT_INFO,
        request.account_address,
        this.indexerChainId,
      )}`,
      '',
      ctx,
    );
    const accountBalances = accountData.data.account_balances;
    const ibcBalances = accountBalances.filter((str) => str.minimal_denom);
    if (ibcBalances.length > 0) {
      //get coin info from config
      const configData = await this.serviceUtil.getDataAPI(
        this.configUrl,
        '',
        ctx,
      );
      const coins = configData.coins;
      for (let i = 0; i < ibcBalances.length; i++) {
        const item = ibcBalances[i];
        const asset = new AssetDto();
        asset.balance = Number(
          (item.amount / this.precisionDiv).toFixed(this.decimals),
        );
        //get ibc info
        const findCoin = coins.find((f) => f.denom === item.minimal_denom);
        if (findCoin) {
          asset.name = findCoin.name;
          asset.symbol = findCoin.display;
          asset.image = findCoin.logo;
          asset.denom = findCoin.denom;
          asset.decimals = findCoin.decimals;
        }
        result.push(asset);
      }
    }
    //filter by keyword
    if (result.length > 0 && request?.keyword) {
      result = result.filter(
        (f) => f.name.toLowerCase().indexOf(request.keyword.toLowerCase()) > -1,
      );
    }

    return { tokens: result, count: result.length };
  }

  async getPriceById(ctx: RequestContext, id: string): Promise<any> {
    this.logger.log(ctx, `${this.getPriceById.name} was called!`);
    let price = 0;
    await this.redisUtil.connect();
    const data = await this.redisUtil.getValue(id);
    if (data) {
      const priceData = JSON.parse(data);
      price = priceData.current_price;
    }

    return price;
  }

  async getTotalAssetByAccountAddress(
    ctx: RequestContext,
    accountAddress: string,
  ): Promise<any> {
    this.logger.log(
      ctx,
      `${this.getTotalAssetByAccountAddress.name} was called!`,
    );
    // let total = 0;
    // const result = await this.tokenContractRepository.getTotalAssetByAccountAddress(accountAddress);
    //get balance of aura wallet
    let balance = 0;
    const accountData = await this.accountService.getAccountDetailByAddress(
      ctx,
      accountAddress,
    );
    balance = accountData ? Number(accountData.total) : 0;
    //get price of aura
    await this.redisUtil.connect();
    const data = await this.redisUtil.getValue(AURA_INFO.COIN_ID);
    let price = 0;
    if (data) {
      const priceData = JSON.parse(data);
      price = priceData.current_price;
    }
    // total = Number(result[0].total) + (balance * price);

    // return total;
    return balance * price;
  }
}
