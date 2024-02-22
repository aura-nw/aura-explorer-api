import {
  InjectQueue,
  OnQueueError,
  OnQueueFailed,
  Process,
  Processor,
} from '@nestjs/bull';
import { Logger, OnModuleInit } from '@nestjs/common';
import { Job, Queue } from 'bull';
import {
  Asset,
  COINGECKO_API,
  INDEXER_API_V2,
  QUEUES,
  INDEXER_V2_DB,
  SYNC_POINT_TYPE,
  ASSETS_TYPE,
} from '../../../shared';
import * as appConfig from '../../../shared/configs/configuration';
import * as util from 'util';
import { ServiceUtil } from '../../../shared/utils/service.util';
import { In, IsNull, Not, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { TokenHolderStatistic } from '../../../shared/entities/token-holder-statistic.entity';
import { AssetsRepository } from '../../asset/repositories/assets.repository';
import { CronExpression } from '@nestjs/schedule';
import { SyncPoint } from 'src/shared/entities/sync-point.entity';

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
    @InjectRepository(SyncPoint)
    private readonly syncPointRepository: Repository<SyncPoint>,
    @InjectQueue(QUEUES.TOKEN.QUEUE_NAME) private readonly tokenQueue: Queue,
  ) {
    this.logger.log(
      '============== Constructor Token Price Processor Service ==============',
    );
    this.appParams = appConfig.default();
    this.chainDB = this.appParams.indexerV2.chainDB;
    this.tokenQueue.add(
      QUEUES.TOKEN.JOB_SYNC_ASSET,
      {},
      {
        repeat: { cron: CronExpression.EVERY_MINUTE },
      },
    );
    this.tokenQueue.add(
      QUEUES.TOKEN.JOB_SYNC_NATIVE_ASSET_HOLDER,
      {},
      {
        repeat: { cron: `2 * * * *` },
      },
    );
    this.tokenQueue.add(
      QUEUES.TOKEN.JOB_SYNC_CW20_ASSET_HOLDER,
      {},
      {
        repeat: { cron: '1 * * * *' },
      },
    );
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

  @Process(QUEUES.TOKEN.JOB_SYNC_ASSET)
  async syncAsset(): Promise<void> {
    let from = new Date(new Date().getTime() - 60 * 1000).toJSON();
    const alreadySynced = await this.syncPointRepository.findOne({
      where: { type: SYNC_POINT_TYPE.FIRST_TIME_SYNC_ASSETS },
    });

    if (!alreadySynced) {
      from = null;

      await this.syncPointRepository.save({
        type: SYNC_POINT_TYPE.FIRST_TIME_SYNC_ASSETS,
      });
    }

    const queryAssets = {
      query: INDEXER_API_V2.GRAPH_QL.ASSETS,
      variables: { from: from },
      operationName: INDEXER_API_V2.OPERATION_NAME.ASSETS,
    };

    const listAsset = await this.getDataWithPagination(queryAssets, 'asset');
    await this.assetsRepository.upsert(listAsset, ['denom']);
  }

  @Process(QUEUES.TOKEN.JOB_SYNC_NATIVE_ASSET_HOLDER)
  async syncNativeAssetHolder(): Promise<void> {
    const listCw20Holders = await this.getNewNativeHolders();

    await this.tokenHolderStatisticRepo.save(listCw20Holders);
  }

  @Process(QUEUES.TOKEN.JOB_SYNC_CW20_ASSET_HOLDER)
  async syncCw20AssetHolder(): Promise<void> {
    const { cw20WithNewImage, listHolderStatistics } =
      await this.getNewCw20Info();

    await this.assetsRepository.save(cw20WithNewImage);

    await this.tokenHolderStatisticRepo.save(listHolderStatistics);
  }

  async getNewNativeHolders(): Promise<TokenHolderStatistic[]> {
    const listCw20Holders: TokenHolderStatistic[] = [];
    const nativeAsset = await this.assetsRepository.find({
      where: {
        type: In([ASSETS_TYPE.IBC, ASSETS_TYPE.IBC]),
      },
    });
    let subQuery = '';

    for (const [index, asset] of nativeAsset.entries()) {
      subQuery =
        subQuery.concat(`total_holder_${index}: account_balance_aggregate(where: {denom: {_eq: "${asset.denom}"}}) {
                            aggregate {
                              count
                            }
                          }`);
    }

    const query = util.format(
      INDEXER_API_V2.GRAPH_QL.BASE_QUERY,
      INDEXER_V2_DB,
      subQuery,
    );

    const graphqlQueryTotalHolder = {
      query,
      operationName: INDEXER_API_V2.OPERATION_NAME.BASE_QUERY,
      variables: {},
    };

    const totalHolders = (
      await this.serviceUtil.fetchDataFromGraphQL(graphqlQueryTotalHolder)
    )?.data[INDEXER_V2_DB];

    for (const [index, asset] of nativeAsset.entries()) {
      const totalHolder = totalHolders[`total_holder_${index}`].aggregate.count;

      const newTokenHolderStatistic = new TokenHolderStatistic();
      newTokenHolderStatistic.totalHolder = totalHolder;
      newTokenHolderStatistic.asset = asset;

      listCw20Holders.push(newTokenHolderStatistic);
    }

    return listCw20Holders;
  }

  async getNewCw20Info(): Promise<{
    cw20WithNewImage: Asset[];
    listHolderStatistics: TokenHolderStatistic[];
  }> {
    const cw20WithNewImage: Asset[] = [];
    const listHolderStatistics: TokenHolderStatistic[] = [];
    const listCw20Asset = await this.assetsRepository.find({
      where: { type: ASSETS_TYPE.CW20 },
    });
    const cw20Query = {
      variables: {},
      query: INDEXER_API_V2.GRAPH_QL.CW20_HOLDER_STAT,
      operationName: INDEXER_API_V2.OPERATION_NAME.CW20_HOLDER_STAT,
    };
    const newCw20Holders = await this.getDataWithPagination(
      cw20Query,
      'cw20_contract',
    );

    for (const cw20Asset of listCw20Asset) {
      const newCw20Image = newCw20Holders.find(
        (cw20) =>
          cw20.smart_contract.address === cw20Asset.denom &&
          cw20Asset.image === null &&
          cw20.marketing_info?.logo?.url,
      );
      if (newCw20Image) {
        cw20Asset.image = newCw20Image.marketing_info?.logo?.url;
        cw20WithNewImage.push(cw20Asset);
      }

      const newCw20Holder = newCw20Holders.find(
        (cw20) => cw20.smart_contract.address === cw20Asset.denom,
      );
      if (newCw20Holder) {
        const newTokenHolderStatistic = new TokenHolderStatistic();
        newTokenHolderStatistic.totalHolder =
          newCw20Holder.cw20_total_holder_stats[0]?.total_holder || 0;
        newTokenHolderStatistic.asset = cw20Asset;
        // listHolderStatistics.push(newTokenHolderStatistic);
        const lastHolderStatistic = await this.tokenHolderStatisticRepo.findOne(
          {
            where: { asset: cw20Asset },
            order: { created_at: 'DESC' },
          },
        );

        if (
          !lastHolderStatistic ||
          !this.isSameDay(new Date(), lastHolderStatistic[0]?.created_at)
        ) {
          const newTokenHolderStatistic = new TokenHolderStatistic();
          newTokenHolderStatistic.totalHolder =
            newCw20Holder.cw20_total_holder_stats[0]?.total_holder;
          newTokenHolderStatistic.asset = cw20Asset;
          // await this.tokenHolderStatisticRepo.save(newTokenHolderStatistic);
          listHolderStatistics.push(newTokenHolderStatistic);
        } else {
          lastHolderStatistic[0].totalHolder =
            newCw20Holder.cw20_total_holder_stats[0]?.total_holder || 0;
          listHolderStatistics.push(lastHolderStatistic[0]);
        }
      }
    }

    return { cw20WithNewImage, listHolderStatistics };
  }

  isSameDay(date1: Date, date2: Date) {
    if (!date1 || !date2) {
      return false;
    }

    return (
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear()
    );
  }
  async getDataWithPagination(query, keyData) {
    const result = [];
    let pageLength;
    do {
      const { data } = await this.serviceUtil.fetchDataFromGraphQL(query);
      const newData = data[INDEXER_V2_DB][keyData];

      result.push(...newData);

      query.variables.id_gt = newData[newData.length - 1].id;
      pageLength = newData.length;
    } while (pageLength === INDEXER_API_V2.MAX_REQUEST);

    result.forEach((data) => {
      delete data.id;
    });

    return result;
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
