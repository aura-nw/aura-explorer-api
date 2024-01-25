import {
  InjectQueue,
  OnQueueError,
  OnQueueFailed,
  Process,
  Processor,
} from '@nestjs/bull';
import { TokenMarketsRepository } from '../../cw20-token/repositories/token-markets.repository';
import { Logger, OnModuleInit } from '@nestjs/common';
import { Job, Queue } from 'bull';
import {
  COINGECKO_API,
  COIN_MARKET_CAP,
  COIN_MARKET_CAP_API,
  INDEXER_API_V2,
  QUEUES,
  TokenMarkets,
} from '../../../shared';
import * as appConfig from '../../../shared/configs/configuration';
import * as util from 'util';
import { ServiceUtil } from '../../../shared/utils/service.util';
import { In, IsNull, Not, Repository } from 'typeorm';
import { CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { TokenHolderStatistic } from '../../../shared/entities/token-holder-statistic.entity';
import { Explorer } from 'src/shared/entities/explorer.entity';

@Processor(QUEUES.TOKEN.QUEUE_NAME)
export class TokenProcessor implements OnModuleInit {
  private readonly logger = new Logger(TokenProcessor.name);
  private appParams: any;

  constructor(
    private serviceUtil: ServiceUtil,
    private tokenMarketsRepository: TokenMarketsRepository,
    @InjectRepository(TokenHolderStatistic)
    private readonly tokenHolderStatisticRepo: Repository<TokenHolderStatistic>,
    @InjectRepository(Explorer)
    private readonly explorerRepository: Repository<Explorer>,
    @InjectQueue(QUEUES.TOKEN.QUEUE_NAME) private readonly tokenQueue: Queue,
  ) {
    this.logger.log(
      '============== Constructor Token Price Processor Service ==============',
    );
    this.appParams = appConfig.default();
  }

  async onModuleInit() {
    this.logger.log(
      '============== On Module Init Token Price Processor Service ==============',
    );
    this.tokenQueue.add(
      QUEUES.TOKEN.JOB_SYNC_CW20_PRICE,
      {},
      {
        repeat: { cron: this.appParams.priceTimeSync },
      },
    );

    const explorer = await this.explorerRepository.find({});
    explorer?.forEach((item) => {
      this.tokenQueue.add(
        QUEUES.TOKEN.JOB_SYNC_TOKEN_HOLDER,
        { explorer: item },
        {
          repeat: { cron: CronExpression.EVERY_DAY_AT_MIDNIGHT },
        },
      );
    });
  }

  @Process(QUEUES.TOKEN.JOB_SYNC_CW20_PRICE)
  async syncCW20TokenPrice(): Promise<void> {
    const numberCW20Tokens =
      await this.tokenMarketsRepository.countCw20TokensHavingCoinId();

    const limit = this.appParams.coingecko.maxRequest;
    const pages = Math.ceil(numberCW20Tokens / limit);
    for (let i = 0; i < pages; i++) {
      // Get data CW20 by paging
      const dataHavingCoinId =
        await this.tokenMarketsRepository.getCw20TokenMarketsHavingCoinId(
          limit,
          i,
        );

      const tokensHavingCoinId = dataHavingCoinId?.map((i) => i.coin_id);
      if (tokensHavingCoinId.length > 0) {
        this.handleSyncPriceVolume(tokensHavingCoinId);
      }
    }
  }

  async handleSyncPriceVolume(listTokens: string[]): Promise<void> {
    try {
      if (this.appParams.priceHostSync === COIN_MARKET_CAP) {
        await this.syncCoinMarketCapPrice(listTokens);
      } else {
        await this.syncCoingeckoPrice(listTokens);
      }
    } catch (err) {
      this.logger.log(`sync-price-volume has error: ${err.message}`, err.stack);
    }
  }

  async syncCoinMarketCapPrice(listTokens) {
    const coinMarketCap = this.appParams.coinMarketCap;
    this.logger.log(`============== Call CoinMarketCap Api ==============`);
    const coinIds = listTokens.join(',');
    const coinMarkets: TokenMarkets[] = [];

    const para = `${util.format(
      COIN_MARKET_CAP_API.GET_COINS_MARKET,
      coinIds,
    )}`;

    const headersRequest = {
      'Content-Type': 'application/json',
      'X-CMC_PRO_API_KEY': coinMarketCap.apiKey,
    };

    const [response, tokenInfos] = await Promise.all([
      this.serviceUtil.getDataAPIWithHeader(
        coinMarketCap.api,
        para,
        headersRequest,
      ),
      this.tokenMarketsRepository.find({
        where: {
          coin_id: In(listTokens),
        },
      }),
    ]);

    if (response?.status?.error_code == 0 && response?.data) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      for (const [key, value] of Object.entries(response?.data)) {
        const data = response?.data[key];
        let tokenInfo = tokenInfos?.find((f) => f.coin_id === data.slug);
        if (tokenInfo) {
          tokenInfo = this.updateCoinMarketsData(tokenInfo, data);
          coinMarkets.push(tokenInfo);
        }
      }
    }
    if (coinMarkets.length > 0) {
      await this.tokenMarketsRepository.save(coinMarkets);
    }
  }

  async syncCoingeckoPrice(listTokens) {
    const coingecko = this.appParams.coingecko;
    this.logger.log(`============== Call Coingecko Api ==============`);
    const coinIds = listTokens.join(',');
    const coinMarkets: TokenMarkets[] = [];

    const para = `${util.format(
      COINGECKO_API.GET_COINS_MARKET,
      coinIds,
      coingecko.maxRequest,
    )}`;

    const [response, tokenInfos] = await Promise.all([
      this.serviceUtil.getDataAPI(coingecko.api, para, ''),
      this.tokenMarketsRepository.find({
        where: {
          coin_id: In(listTokens),
        },
      }),
    ]);

    if (response) {
      for (let index = 0; index < response.length; index++) {
        const data = response[index];
        const tokenInfo = tokenInfos?.filter((f) => f.coin_id === data.id);
        tokenInfo?.forEach((item) => {
          const tokenInfoUpdated = this.updateTokenMarketsData(item, data);
          coinMarkets.push(tokenInfoUpdated);
        });
      }
    }
    if (coinMarkets.length > 0) {
      await this.tokenMarketsRepository.save(coinMarkets);
    }
  }

  updateCoinMarketsData(currentData: TokenMarkets, data: any): TokenMarkets {
    const quote = data.quote?.USD;
    const coinInfo = { ...currentData };
    coinInfo.current_price = Number(quote?.price?.toFixed(6)) || 0;
    coinInfo.price_change_percentage_24h =
      Number(quote?.percent_change_24h?.toFixed(6)) || 0;
    coinInfo.total_volume = Number(quote?.volume_24h?.toFixed(6)) || 0;
    coinInfo.circulating_supply =
      Number(data.circulating_supply?.toFixed(6)) || 0;
    const circulating_market_cap =
      coinInfo.circulating_supply * coinInfo.current_price;
    coinInfo.circulating_market_cap =
      Number(circulating_market_cap?.toFixed(6)) || 0;
    coinInfo.max_supply = Number(data.max_supply?.toFixed(6)) || 0;
    coinInfo.market_cap =
      Number(data.self_reported_market_cap?.toFixed(6)) || 0;
    coinInfo.fully_diluted_valuation =
      Number(quote?.fully_diluted_market_cap?.toFixed(6)) || 0;

    return coinInfo;
  }

  updateTokenMarketsData(currentData: TokenMarkets, data: any): TokenMarkets {
    const coinInfo = { ...currentData };
    coinInfo.current_price = Number(data.current_price?.toFixed(6)) || 0;
    coinInfo.price_change_percentage_24h =
      Number(data.price_change_percentage_24h?.toFixed(6)) || 0;
    coinInfo.total_volume = Number(data.total_volume?.toFixed(6)) || 0;
    coinInfo.circulating_supply =
      Number(data.circulating_supply?.toFixed(6)) || 0;

    const circulating_market_cap =
      coinInfo.circulating_supply * coinInfo.current_price;
    coinInfo.circulating_market_cap =
      Number(circulating_market_cap?.toFixed(6)) || 0;
    coinInfo.max_supply = Number(data.max_supply?.toFixed(6)) || 0;
    coinInfo.market_cap = Number(data.market_cap?.toFixed(6)) || 0;
    coinInfo.fully_diluted_valuation =
      Number(data.fully_diluted_valuation?.toFixed(6)) || 0;

    return coinInfo;
  }

  @Process(QUEUES.TOKEN.JOB_SYNC_TOKEN_HOLDER)
  async syncAuraTokenHolder(job: Job): Promise<void> {
    const explorer = job.data.explorer;
    const tokenMarkets = await this.tokenMarketsRepository.find({
      where: { denom: Not(IsNull()), explorer: { id: explorer.id } },
    });

    let subQuery = '';
    for (const [index, denom] of tokenMarkets.entries()) {
      subQuery =
        subQuery.concat(`total_holder_${index}: account_balance_aggregate(where: {denom: {_eq: "${denom.denom}"}}) {
                            aggregate {
                              count
                            }
                          }`);
    }

    const query = util.format(
      INDEXER_API_V2.GRAPH_QL.BASE_QUERY,
      explorer.chainDB,
      subQuery,
    );

    const graphqlQueryTotalHolder = {
      query,
      operationName: INDEXER_API_V2.OPERATION_NAME.BASE_QUERY,
      variables: {},
    };

    const totalHolders = (
      await this.serviceUtil.fetchDataFromGraphQL(graphqlQueryTotalHolder)
    )?.data[explorer.chainDB];

    const totalHolderStatistics = [];
    for (const [index, tokenMarket] of tokenMarkets.entries()) {
      const totalHolder = totalHolders[`total_holder_${index}`].aggregate.count;

      const newTokenHolderStatistic = new TokenHolderStatistic();
      newTokenHolderStatistic.totalHolder = totalHolder;
      newTokenHolderStatistic.tokenMarket = tokenMarket;

      totalHolderStatistics.push(newTokenHolderStatistic);
    }

    await this.tokenHolderStatisticRepo.save(totalHolderStatistics);
  }

  @OnQueueError()
  onError(job: Job, error: Error) {
    this.logger.error(`Error job ${job.id} of type ${job.name}`);
    this.logger.error(`Error: ${error}`);
  }

  @OnQueueFailed()
  async onFailed(job: Job, error: Error) {
    this.logger.error(`Failed job ${job.id} of type ${job.name}`);
    this.logger.error(`Error: ${error}`);
  }
}
