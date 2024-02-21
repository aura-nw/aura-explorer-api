import {
  InjectQueue,
  OnQueueError,
  OnQueueFailed,
  Process,
  Processor,
} from '@nestjs/bull';
import { Logger, OnModuleInit } from '@nestjs/common';
import { Job, Queue } from 'bull';
import { Asset, COINGECKO_API, INDEXER_API_V2, QUEUES } from '../../../shared';
import * as appConfig from '../../../shared/configs/configuration';
import * as util from 'util';
import { ServiceUtil } from '../../../shared/utils/service.util';
import { In, IsNull, Not, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { TokenHolderStatistic } from '../../../shared/entities/token-holder-statistic.entity';
import { AssetsRepository } from '../../asset/repositories/assets.repository';
import { CronExpression } from '@nestjs/schedule';

@Processor(QUEUES.TOKEN.QUEUE_NAME)
export class TokenProcessor implements OnModuleInit {
  private readonly logger = new Logger(TokenProcessor.name);
  private appParams: any;
  private chainDB;

  constructor(
    private serviceUtil: ServiceUtil,
    private assetsRepository: AssetsRepository,
    @InjectRepository(TokenHolderStatistic)
    private readonly tokenHolderStatisticRepo: Repository<TokenHolderStatistic>,
    @InjectQueue(QUEUES.TOKEN.QUEUE_NAME) private readonly tokenQueue: Queue,
  ) {
    this.logger.log(
      '============== Constructor Token Price Processor Service ==============',
    );
    this.appParams = appConfig.default();
    this.chainDB = this.appParams.indexerV2.chainDB;
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
    this.tokenQueue.add(
      QUEUES.TOKEN.JOB_SYNC_TOKEN_HOLDER,
      {},
      {
        repeat: { cron: CronExpression.EVERY_DAY_AT_MIDNIGHT },
      },
    );
  }

  @Process(QUEUES.TOKEN.JOB_SYNC_CW20_PRICE)
  async syncCW20TokenPrice(): Promise<void> {
    const numberCW20Tokens =
      await this.assetsRepository.countAssetsHavingCoinId();

    const limit = this.appParams.coingecko.maxRequest;
    const pages = Math.ceil(numberCW20Tokens / limit);
    for (let i = 0; i < pages; i++) {
      // Get data CW20 by paging
      const dataHavingCoinId =
        await this.assetsRepository.getAssetsHavingCoinId(limit, i);

      const tokensHavingCoinId = dataHavingCoinId?.map((i) => i.coin_id);
      if (tokensHavingCoinId.length > 0) {
        this.syncCoingeckoPrice(tokensHavingCoinId);
      }
    }
  }

  async syncCoingeckoPrice(listTokens) {
    const coingecko = this.appParams.coingecko;
    this.logger.log(`============== Call Coingecko Api ==============`);
    const coinIds = listTokens.join(',');
    const coinMarkets: Asset[] = [];

    const para = `${util.format(
      COINGECKO_API.GET_COINS_MARKET,
      coinIds,
      coingecko.maxRequest,
    )}`;

    const [response, tokenInfos] = await Promise.all([
      this.serviceUtil.getDataAPI(coingecko.api, para, ''),
      this.assetsRepository.find({
        where: {
          coinId: In(listTokens),
        },
      }),
    ]);

    if (response) {
      for (let index = 0; index < response.length; index++) {
        const data = response[index];
        const tokenInfo = tokenInfos?.filter((f) => f.coinId === data.id);
        tokenInfo?.forEach((item) => {
          const tokenInfoUpdated = this.updateTokenMarketsData(item, data);
          coinMarkets.push(tokenInfoUpdated);
        });
      }
    }
    if (coinMarkets.length > 0) {
      await this.assetsRepository.save(coinMarkets);
    }
  }

  updateTokenMarketsData(currentData: Asset, data: any): Asset {
    const coinInfo = { ...currentData };
    coinInfo.currentPrice = Number(data.current_price?.toFixed(6)) || 0;
    coinInfo.priceChangePercentage24h =
      Number(data.price_change_percentage_24h?.toFixed(6)) || 0;
    return coinInfo;
  }

  @Process(QUEUES.TOKEN.JOB_SYNC_TOKEN_HOLDER)
  async syncAuraTokenHolder(): Promise<void> {
    const assets = await this.assetsRepository.find({
      where: { denom: Not(IsNull()) },
    });

    let subQuery = '';
    for (const [index, denom] of assets.entries()) {
      subQuery =
        subQuery.concat(`total_holder_${index}: account_balance_aggregate(where: {denom: {_eq: "${denom.denom}"}}) {
                            aggregate {
                              count
                            }
                          }`);
    }

    const query = util.format(
      INDEXER_API_V2.GRAPH_QL.BASE_QUERY,
      this.chainDB,
      subQuery,
    );

    const graphqlQueryTotalHolder = {
      query,
      operationName: INDEXER_API_V2.OPERATION_NAME.BASE_QUERY,
      variables: {},
    };

    const totalHolders = (
      await this.serviceUtil.fetchDataFromGraphQL(graphqlQueryTotalHolder)
    )?.data[this.chainDB];

    const totalHolderStatistics = [];
    for (const [index, asset] of assets.entries()) {
      const totalHolder = totalHolders[`total_holder_${index}`].aggregate.count;

      const newTokenHolderStatistic = new TokenHolderStatistic();
      newTokenHolderStatistic.totalHolder = totalHolder;
      newTokenHolderStatistic.asset = asset;

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
