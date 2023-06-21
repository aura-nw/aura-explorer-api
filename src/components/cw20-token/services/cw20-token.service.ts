import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';
import { SmartContractRepository } from '../../../components/contract/repositories/smart-contract.repository';
import { In } from 'typeorm';
import * as util from 'util';
import { AccountService } from '../../../components/account/services/account.service';
import {
  AkcLogger,
  AURA_INFO,
  INDEXER_API,
  INDEXER_API_V2,
  LENGTH,
  RequestContext,
  TokenMarkets,
} from '../../../shared';
import * as appConfig from '../../../shared/configs/configuration';
import { ServiceUtil } from '../../../shared/utils/service.util';
import { AssetDto } from '../dtos/asset.dto';
import { Cw20TokenByOwnerParamsDto } from '../dtos/cw20-token-by-owner-params.dto';
import { Cw20TokenParamsDto } from '../dtos/cw20-token-params.dto';
import { TokenMarketsRepository } from '../repositories/token-markets.repository';

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
  private chainDB;

  constructor(
    private readonly logger: AkcLogger,
    private tokenMarketsRepository: TokenMarketsRepository,
    private smartContractRepository: SmartContractRepository,
    private serviceUtil: ServiceUtil,
    private accountService: AccountService,
    private httpService: HttpService,
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
    this.chainDB = this.appParams.indexerV2.chainDB;
  }

  async getCw20Tokens(
    ctx: RequestContext,
    request: Cw20TokenParamsDto,
  ): Promise<any> {
    this.logger.log(ctx, `${this.getCw20Tokens.name} was called!`);

    // Attributes for cw20
    const cw20Attributes = `marketing_info
      name
      symbol
      smart_contract {
        address
      }
      cw20_holders {
        amount
        address
      }`;

    const graphqlQuery = {
      query: util.format(
        INDEXER_API_V2.GRAPH_QL.CW20_LIST_TOKEN,
        this.chainDB,
        cw20Attributes,
      ),
      variables: {
        keyword: request?.keyword ? request?.keyword : null,
        limit: request?.limit,
        offset: request?.offset,
      },
      operationName: INDEXER_API_V2.OPERATION_NAME.CW20_LIST_TOKEN,
    };

    const response = (await this.serviceUtil.fetchDataFromGraphQL(graphqlQuery))
      .data[this.chainDB]['cw20_contract'];

    if (response?.length == 0) {
      return { tokens: response, count: 0 };
    }

    const listAddress = response.map((item) => item.smart_contract.address);

    const tokenMarket = await this.tokenMarketsRepository.find({
      where: { contract_address: In(listAddress) },
    });

    const tokens = response.map((item) => {
      const holders = item.cw20_holders?.length;
      const holders_change_percentage_24h = 0;

      const tokenFind = tokenMarket?.find(
        (f) => String(f.contract_address) === item.smart_contract.address,
      );
      return {
        coin_id: tokenFind?.coin_id || '',
        contract_address: item.smart_contract.address || '',
        name: item.name || '',
        symbol: item.symbol || '',
        image: item.marketing_info?.logo?.url
          ? item.marketing_info?.logo?.url
          : tokenFind?.image || '',
        description: tokenFind?.description || '',
        circulating_market_cap: tokenFind?.circulating_market_cap || 0,
        volume_24h: tokenFind?.total_volume || 0,
        price: tokenFind?.current_price || 0,
        price_change_percentage_24h:
          tokenFind?.price_change_percentage_24h || 0,
        holders_change_percentage_24h,
        holders,
        max_total_supply: tokenFind?.max_supply || 0,
        fully_diluted_market_cap: tokenFind?.fully_diluted_valuation || 0,
      };
    });

    return {
      tokens,
      count: response?.cw20_contract_aggregate?.aggregate?.count,
    };
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

    const params = [
      request.account_address,
      this.indexerChainId,
      limit,
      offset,
    ];

    let getByOwnerUrl = `${this.indexerUrl}${util.format(
      INDEXER_API.GET_CW20_TOKENS_BY_OWNER,
      ...params,
    )}`;

    const isSearchByContractAddress =
      keyword.startsWith(AURA_INFO.CONTRACT_ADDRESS) &&
      keyword.length === LENGTH.CONTRACT_ADDRESS;

    if (keyword) {
      if (isSearchByContractAddress) {
        getByOwnerUrl = `${getByOwnerUrl}&contractAddress=${keyword}`;
      } else {
        getByOwnerUrl = `${getByOwnerUrl}&tokenName=${keyword}`;
      }
    }

    const resultGetCw20Tokens = await this.serviceUtil.getDataAPI(
      getByOwnerUrl,
      '',
      ctx,
    );

    const asset = resultGetCw20Tokens?.data?.assets?.CW20?.asset;
    const count = resultGetCw20Tokens?.data?.assets?.CW20?.count;

    let tokens = [];
    if (asset.length > 0) {
      const listContract_address = asset?.map((i) => i.contract_address);
      const listTokenMarketsInfo = await this.tokenMarketsRepository.find({
        where: { contract_address: In(listContract_address) },
      });
      tokens = asset.map((item) => {
        const tokenMarketsInfo = listTokenMarketsInfo.find(
          (f) => f.contract_address === item.contract_address,
        );
        const asset = new AssetDto();
        asset.contract_address = item.contract_address || '-';
        asset.image = tokenMarketsInfo?.image || '';
        asset.name = item.asset_info?.data?.name || '';
        asset.symbol = item.asset_info?.data?.symbol || '';
        asset.decimals = item.asset_info?.data?.decimals || 0;
        asset.balance = item.balance || 0;
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

    return balance * price;
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
