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
  SYNC_POINT_TYPE,
  ASSETS_TYPE,
} from '../../../shared';
import * as appConfig from '../../../shared/configs/configuration';
import * as util from 'util';
import { ServiceUtil } from '../../../shared/utils/service.util';
import { In, LessThan, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { TokenHolderStatistic } from '../../../shared/entities/token-holder-statistic.entity';
import { AssetsRepository } from '../../asset/repositories/assets.repository';
import { CronExpression } from '@nestjs/schedule';
import { SyncPoint } from '../../../shared/entities/sync-point.entity';
import { TransactionHelper } from '../../../shared/helpers/transaction.helper';
import * as moment from 'moment';
import { Explorer } from '../../../shared/entities/explorer.entity';

@Processor(QUEUES.TOKEN.QUEUE_NAME)
export class TokenProcessor implements OnModuleInit {
  private readonly logger = new Logger(TokenProcessor.name);
  private appParams: any;

  constructor(
    private serviceUtil: ServiceUtil,
    private assetsRepository: AssetsRepository,
    @InjectRepository(TokenHolderStatistic)
    private readonly tokenHolderStatisticRepo: Repository<TokenHolderStatistic>,
    @InjectRepository(SyncPoint)
    private readonly syncPointRepository: Repository<SyncPoint>,
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

    const explorer = await this.explorerRepository.find();

    explorer.forEach((explorer, index) => {
      this.tokenQueue.add(
        QUEUES.TOKEN.JOB_SYNC_ASSET,
        { explorer },
        {
          repeat: { cron: `${index + 1}0 * * * * *` },
        },
      );
      this.tokenQueue.add(
        QUEUES.TOKEN.JOB_SYNC_NATIVE_ASSET_HOLDER,
        { explorer },
        {
          repeat: { cron: `${index + 2} * * * *` },
        },
      );
      this.tokenQueue.add(
        QUEUES.TOKEN.JOB_SYNC_CW20_ASSET_HOLDER,
        { explorer },
        {
          repeat: { cron: `${index + 1} * * * *` },
        },
      );
      this.tokenQueue.add(
        QUEUES.TOKEN.JOB_SYNC_ERC20_ASSET_HOLDER,
        { explorer },
        {
          repeat: { cron: `${index + 3} * * * *` },
        },
      );
    });

    this.tokenQueue.add(
      QUEUES.TOKEN.JOB_SYNC_CW20_PRICE,
      {},
      {
        repeat: { cron: this.appParams.priceTimeSync },
      },
    );

    this.tokenQueue.add(
      QUEUES.TOKEN.JOB_CLEAN_ASSET_HOLDER,
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
    coinInfo.currentPrice = Number(data.current_price?.toFixed(6));
    coinInfo.priceChangePercentage24h = Number(
      data.price_change_percentage_24h?.toFixed(6),
    );
    coinInfo.marketCap = Number(data.market_cap?.toFixed(6));
    coinInfo.totalVolume = Number(data.total_volume?.toFixed(6));
    return coinInfo;
  }

  @Process(QUEUES.TOKEN.JOB_SYNC_ASSET)
  async syncAsset(job: Job): Promise<void> {
    const explorer: Explorer = job.data.explorer;
    let from = new Date(new Date().getTime() - 60 * 1000).toJSON();
    const alreadySynced = await this.syncPointRepository.findOne({
      where: {
        type: SYNC_POINT_TYPE.FIRST_TIME_SYNC_ASSETS,
        explorer: { id: explorer.id },
      },
    });

    if (!alreadySynced) {
      from = null;

      await this.syncPointRepository.save({
        type: SYNC_POINT_TYPE.FIRST_TIME_SYNC_ASSETS,
        explorer: { id: explorer.id },
      });
    }

    const queryAssets = {
      query: util.format(INDEXER_API_V2.GRAPH_QL.ASSETS, explorer.chainDb),
      variables: { from: from },
      operationName: INDEXER_API_V2.OPERATION_NAME.ASSETS,
    };

    const listAsset = await this.getDataWithPagination(
      queryAssets,
      'asset',
      explorer,
    );
    await this.assetsRepository.storeAsset(listAsset);
  }

  @Process(QUEUES.TOKEN.JOB_SYNC_NATIVE_ASSET_HOLDER)
  async syncNativeAssetHolder(job: Job): Promise<void> {
    const listHolderStatistic = await this.getHolders(job.data.explorer, [
      ASSETS_TYPE.IBC,
      ASSETS_TYPE.NATIVE,
    ]);

    await this.upsertTokenHolderStatistic(listHolderStatistic);
  }

  @Process(QUEUES.TOKEN.JOB_SYNC_CW20_ASSET_HOLDER)
  async syncCw20AssetHolder(job: Job): Promise<void> {
    const { cw20WithNewImage, listHolderStatistic } = await this.getNewCw20Info(
      job.data.explorer,
    );

    await this.assetsRepository.save(cw20WithNewImage);

    await this.upsertTokenHolderStatistic(listHolderStatistic);
  }

  async getHolders(
    explorer: Explorer,
    type: string[],
  ): Promise<TokenHolderStatistic[]> {
    const listHolder: TokenHolderStatistic[] = [];
    const nativeAsset = await this.assetsRepository.find({
      where: {
        type: In(type),
        explorer: { id: explorer.id },
      },
    });
    let subQuery = '';

    for (const [index, asset] of nativeAsset.entries()) {
      subQuery =
        subQuery.concat(`total_holder_${index}: account_balance_aggregate(where: {denom: {_eq: "${asset.denom}"}, amount: {_gt: "0"}}) {
                            aggregate {
                              count
                            }
                          }`);
    }

    const query = util.format(
      INDEXER_API_V2.GRAPH_QL.BASE_QUERY,
      explorer.chainDb,
      subQuery,
    );

    const graphqlQueryTotalHolder = {
      query,
      operationName: INDEXER_API_V2.OPERATION_NAME.BASE_QUERY,
      variables: {},
    };

    const totalHolders = (
      await this.serviceUtil.fetchDataFromGraphQL(graphqlQueryTotalHolder)
    )?.data[explorer.chainDb];

    for (const [index, asset] of nativeAsset.entries()) {
      const newTotalHolder =
        totalHolders[`total_holder_${index}`].aggregate.count;

      const newHolderStatistic = new TokenHolderStatistic();
      newHolderStatistic.id = null;
      newHolderStatistic.asset = asset;
      newHolderStatistic.totalHolder = newTotalHolder;
      newHolderStatistic.date = new Date();

      listHolder.push(newHolderStatistic);
    }

    return listHolder;
  }

  @Process(QUEUES.TOKEN.JOB_CLEAN_ASSET_HOLDER)
  async cleanAssetHolder(): Promise<void> {
    await this.tokenHolderStatisticRepo.delete({
      created_at: LessThan(moment().subtract(2, 'days').toDate()),
    });
  }
  async getNewCw20Info(explorer: Explorer): Promise<{
    cw20WithNewImage: Asset[];
    listHolderStatistic: TokenHolderStatistic[];
  }> {
    const cw20WithNewImage: Asset[] = [];
    const listHolderStatistic: TokenHolderStatistic[] = [];
    const listCw20Asset = await this.assetsRepository.find({
      where: { type: ASSETS_TYPE.CW20, explorer: { id: explorer.id } },
    });
    const cw20Query = {
      variables: {},
      query: util.format(
        INDEXER_API_V2.GRAPH_QL.CW20_HOLDER_STAT,
        explorer.chainDb,
      ),
      operationName: INDEXER_API_V2.OPERATION_NAME.CW20_HOLDER_STAT,
    };
    const newCw20Holders = await this.getDataWithPagination(
      cw20Query,
      'cw20_contract',
      explorer,
    );

    for (const cw20Asset of listCw20Asset) {
      if (!cw20Asset.image || !cw20Asset.symbol) {
        const newCw20Image = newCw20Holders.find(
          (cw20) => cw20.smart_contract.address === cw20Asset.denom,
        );
        cw20Asset.image = newCw20Image?.marketing_info?.logo?.url || '';
        cw20Asset.symbol = newCw20Image?.symbol || '';

        cw20WithNewImage.push(cw20Asset);
      }

      const newCw20Holder = newCw20Holders.find(
        (cw20) => cw20.smart_contract.address === cw20Asset.denom,
      );

      if (newCw20Holder?.cw20_total_holder_stats[0]) {
        const newCw20HolderStatistic = new TokenHolderStatistic();
        newCw20HolderStatistic.id = null;
        newCw20HolderStatistic.totalHolder =
          newCw20Holder.cw20_total_holder_stats[0]?.total_holder;
        newCw20HolderStatistic.date =
          newCw20Holder.cw20_total_holder_stats[0]?.date;
        newCw20HolderStatistic.asset = cw20Asset;
        listHolderStatistic.push(newCw20HolderStatistic);
      }
    }

    return { cw20WithNewImage, listHolderStatistic };
  }

  @Process(QUEUES.TOKEN.JOB_SYNC_ERC20_ASSET_HOLDER)
  async syncErc20AssetHolder(job: Job): Promise<void> {
    const erc20Asset = await this.getNewErc20Info(job.data.explorer);
    const listHolderStatistic = await this.getHolders(job.data.explorer, [
      ASSETS_TYPE.ERC20,
    ]);

    await this.assetsRepository.save(erc20Asset);
    await this.upsertTokenHolderStatistic(listHolderStatistic);
  }

  async getNewErc20Info(explorer: Explorer): Promise<Asset[]> {
    const erc20Asset: Asset[] = [];
    const listErc20Asset = await this.assetsRepository.find({
      where: { type: ASSETS_TYPE.ERC20, explorer: { id: explorer.id } },
    });

    const erc20Query = {
      variables: {},
      query: util.format(INDEXER_API_V2.GRAPH_QL.ERC20_INFO, explorer.chainDb),
      operationName: INDEXER_API_V2.OPERATION_NAME.ERC20_INFO,
    };
    const listErc20Contract = await this.getDataWithPagination(
      erc20Query,
      'erc20_contract',
      explorer,
    );
    for (const erc20 of listErc20Asset) {
      if (!erc20.name || !erc20.symbol) {
        const erc20Contract = listErc20Contract.find(
          (item) => item.address === erc20.denom,
        );
        if (erc20Contract) {
          erc20.symbol = erc20Contract?.symbol || '';
          erc20.name = erc20Contract?.name || '';
          erc20Asset.push(erc20);
        }
      }
    }
    return erc20Asset;
  }

  async getDataWithPagination(query: any, keyData: string, explorer: Explorer) {
    const result = [];
    let pageLength;

    do {
      const { data } = await this.serviceUtil.fetchDataFromGraphQL(query);
      const newData = data ? data[explorer.chainDb][keyData] : [];

      if (keyData === 'asset') {
        newData.map((asset) => {
          asset.totalSupply = TransactionHelper.balanceOf(
            asset.total_supply || 0,
            asset.decimal || explorer.decimal,
          );
          asset.explorer = explorer;
          return asset;
        });
      }

      result.push(...newData);

      query.variables.id_gt = newData[newData.length - 1]?.id;
      pageLength = newData.length;
    } while (pageLength === INDEXER_API_V2.MAX_REQUEST);

    result.map((e) => (e.id = null));

    return result;
  }

  async upsertTokenHolderStatistic(
    listHolderStatistic: TokenHolderStatistic[],
  ) {
    await this.tokenHolderStatisticRepo
      .createQueryBuilder()
      .insert()
      .values(listHolderStatistic)
      .orUpdate(['total_holder'], ['asset', 'date'])
      .execute();
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
