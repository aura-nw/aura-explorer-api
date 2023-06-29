import { Injectable } from '@nestjs/common';
import { In, Not } from 'typeorm';
import * as util from 'util';
import { AccountService } from '../../../components/account/services/account.service';
import {
  AkcLogger,
  AURA_INFO,
  INDEXER_API_V2,
  LENGTH,
  RequestContext,
  TokenMarkets,
} from '../../../shared';
import * as appConfig from '../../../shared/configs/configuration';
import { ServiceUtil } from '../../../shared/utils/service.util';
import { AssetDto } from '../dtos/asset.dto';
import { Cw20TokenByOwnerParamsDto } from '../dtos/cw20-token-by-owner-params.dto';
import { TokenMarketsRepository } from '../repositories/token-markets.repository';
import { Cw20TokenMarketParamsDto } from '../dtos/cw20-token-market-params.dto';

@Injectable()
export class Cw20TokenService {
  private appParams;
  private denom;
  private minimalDenom;
  private decimals;
  private precisionDiv;
  private configUrl;
  private chainDB;

  constructor(
    private readonly logger: AkcLogger,
    private tokenMarketsRepository: TokenMarketsRepository,
    private serviceUtil: ServiceUtil,
    private accountService: AccountService,
  ) {
    this.logger.setContext(Cw20TokenService.name);
    this.appParams = appConfig.default();
    this.denom = this.appParams.chainInfo.coinDenom;
    this.minimalDenom = this.appParams.chainInfo.coinMinimalDenom;
    this.decimals = this.appParams.chainInfo.coinDecimals;
    this.precisionDiv = this.appParams.chainInfo.precisionDiv;
    this.configUrl = this.appParams.configUrl;
    this.chainDB = this.appParams.indexerV2.chainDB;
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
    assetDto.verify_text = 'Verified by Aura Network';
    assetDto.verify_status = 'VERIFIED';

    //get balance
    const [totalBalances, tokenData] = await Promise.all([
      this.accountService.getAccountDetailByAddress(
        ctx,
        request.account_address,
      ),
      this.tokenMarketsRepository.findOne({
        where: { coin_id: AURA_INFO.COIN_ID },
      }),
    ]);

    assetDto.balance =
      totalBalances && totalBalances?.total ? totalBalances.total : 0;
    // price of aura
    if (tokenData) {
      assetDto.price = tokenData.current_price || 0;
      assetDto.price_change_percentage_24h =
        tokenData.price_change_percentage_24h || 0;

      assetDto.max_total_supply = tokenData.max_supply || 0;
    }

    //get value
    assetDto.value = (
      Number(assetDto.balance) * Number(assetDto.price)
    ).toString();
    result.push(assetDto);

    //Get IBC tokens
    const ibcTokens = await this.getIBCTokens(ctx, request.account_address);
    if (ibcTokens && ibcTokens?.length > 0) {
      result.push(...ibcTokens);
    }

    const keyword = request.keyword;

    if (keyword) {
      result = result.filter(
        (f) => f.name?.toLowerCase() === keyword.toLowerCase(),
      );
    }

    let limit = request.limit;
    let offset = request.offset;

    if (request.offset === 0) {
      limit -= result.length;
    } else {
      offset -= result.length;
    }

    // Attributes for cw20
    const cw20Attributes = `marketing_info
      name
      symbol
      decimal
      smart_contract {
        address
      }
      cw20_holders {
        amount
        address
      }`;

    const isSearchByContractAddress =
      keyword.startsWith(AURA_INFO.CONTRACT_ADDRESS) &&
      keyword.length === LENGTH.CONTRACT_ADDRESS;
    let contractAddress;
    let tokenName;
    if (keyword) {
      if (isSearchByContractAddress) {
        contractAddress = keyword;
      } else {
        tokenName = `%${keyword}%`;
      }
    }

    const graphqlQuery = {
      query: util.format(
        INDEXER_API_V2.GRAPH_QL.CW20_OWNER,
        this.chainDB,
        cw20Attributes,
      ),
      variables: {
        limit: limit,
        offset: offset,
        owner: request?.account_address,
        address: contractAddress,
        name: tokenName,
      },
      operationName: INDEXER_API_V2.OPERATION_NAME.CW20_OWNER,
    };

    const response = (await this.serviceUtil.fetchDataFromGraphQL(graphqlQuery))
      .data[this.chainDB];

    const asset = response?.cw20_contract;
    const count = response?.cw20_contract_aggregate?.aggregate?.count;

    let tokens = [];
    if (asset?.length > 0) {
      const listContract_address = asset?.map((i) => i.smart_contract.address);
      const listTokenMarketsInfo = await this.tokenMarketsRepository.find({
        where: { contract_address: In(listContract_address) },
      });
      tokens = asset.map((item) => {
        const tokenMarketsInfo = listTokenMarketsInfo.find(
          (f) => f.contract_address === item.smart_contract.address,
        );
        const asset = new AssetDto();
        asset.contract_address = item.smart_contract.address || '-';
        asset.image = tokenMarketsInfo?.image || '';
        asset.verify_status = tokenMarketsInfo?.verify_status || '';
        asset.verify_text = tokenMarketsInfo?.verify_text || '';
        asset.name = item.name || '';
        asset.symbol = item.symbol || '';
        asset.decimals = item.decimals || 0;
        asset.balance =
          item.cw20_holders?.find((f) => f.address === request?.account_address)
            .amount || 0;
        asset.price = tokenMarketsInfo?.current_price || 0;
        asset.price_change_percentage_24h =
          tokenMarketsInfo?.price_change_percentage_24h || 0;
        asset.value = (Number(asset.balance) * Number(asset.price)).toString();
        return asset;
      });
    }

    if (request.offset === 0) {
      tokens = result.concat(tokens);
    }

    return { tokens, count: count + result.length };
  }

  async getPriceById(ctx: RequestContext, id: string): Promise<any> {
    this.logger.log(ctx, `${this.getPriceById.name} was called!`);
    const tokenData = await this.tokenMarketsRepository.findOne({
      where: { coin_id: id },
    });

    return tokenData?.current_price || 0;
  }

  async getTokenMarket(
    ctx: RequestContext,
    request: Cw20TokenMarketParamsDto,
  ): Promise<TokenMarkets[]> {
    this.logger.log(ctx, `${this.getPriceById.name} was called!`);
    const listAddress = request?.contractAddress ? request.contractAddress : [];
    if (listAddress.length > 0) {
      return await this.tokenMarketsRepository.find({
        where: { contract_address: In(listAddress) },
      });
    } else {
      return await this.tokenMarketsRepository.find({
        where: { coin_id: Not('') },
      });
    }
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
    //get balance of aura wallet
    let balance = 0;
    const accountData = await this.accountService.getAccountDetailByAddress(
      ctx,
      accountAddress,
    );
    balance = accountData ? Number(accountData.total) : 0;

    const tokenData = await this.tokenMarketsRepository.findOne({
      where: { coin_id: AURA_INFO.COIN_ID },
    });
    const price = tokenData?.current_price || 0;

    const auraPrice = balance * price;

    // Attributes for cw20
    const cw20Attributes = `
     smart_contract {
       address
     }
     cw20_holders {
       amount
       address
     }`;

    const graphqlQuery = {
      query: util.format(
        INDEXER_API_V2.GRAPH_QL.CW20_HOLDER,
        this.chainDB,
        cw20Attributes,
      ),
      variables: {
        owner: accountAddress,
      },
      operationName: INDEXER_API_V2.OPERATION_NAME.CW20_HOLDER,
    };

    const response = (await this.serviceUtil.fetchDataFromGraphQL(graphqlQuery))
      .data[this.chainDB]['cw20_contract'];

    let cw20Price = 0;

    if (response?.length > 0) {
      const listTokenMarketsInfo = await this.tokenMarketsRepository.find({
        where: { coin_id: Not('') },
      });
      response.forEach((item) => {
        const tokenMarketsInfo = listTokenMarketsInfo?.find(
          (f) => f.contract_address === item.smart_contract.address,
        );
        const price = Number(tokenMarketsInfo?.current_price) || 0;
        const holder = item.cw20_holders?.find(
          (item) => item.address === accountAddress,
        );
        cw20Price += price * holder?.amount;
      });
    }

    return auraPrice + cw20Price;
  }

  /**
   * Get IBC token
   * @param ctx
   * @param accountAddress
   */
  async getIBCTokens(ctx: RequestContext, accountAddress: string) {
    this.logger.log(ctx, `${this.getIBCTokens.name} was called!`);
    const result = [];
    // get account detail
    const accountAttributes = `type
      sequence
      spendable_balances
      pubkey
      id
      balances
      account_number
      address`;

    const graphqlQuery = {
      query: util.format(
        INDEXER_API_V2.GRAPH_QL.ACCOUNT,
        this.chainDB,
        accountAttributes,
      ),
      variables: {
        address: accountAddress,
      },
      operationName: INDEXER_API_V2.OPERATION_NAME.ACCOUNT,
    };
    const accountData = (
      await this.serviceUtil.fetchDataFromGraphQL(graphqlQuery)
    ).data[this.chainDB]['account'];
    const accountBalances =
      accountData?.length > 0 ? accountData[0]?.balances : [];
    const ibcBalances = accountBalances?.filter(
      (str) => str?.minimal_denom || str?.denom,
    );
    if (ibcBalances?.length > 0) {
      //get coin info from config
      const configData = await this.serviceUtil.getDataAPI(
        this.configUrl,
        '',
        ctx,
      );
      const coins = configData?.coins;
      for (let i = 0; i < ibcBalances.length; i++) {
        const item = ibcBalances[i];
        const asset = new AssetDto();
        asset.balance = Number(
          (item.amount / this.precisionDiv).toFixed(this.decimals),
        );
        //get ibc info
        const denom = item.minimal_denom || item.denom;
        const findCoin = coins?.find((f) => f.denom === denom);
        if (findCoin) {
          asset.name = findCoin.name;
          asset.symbol = findCoin.display;
          asset.image = findCoin.logo;
          asset.denom = findCoin.denom;
          asset.decimals = Number(findCoin.decimal) || 0;
          result.push(asset);
        }
      }
    }
    return result;
  }
}
