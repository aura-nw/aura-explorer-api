import { InjectQueue, Process, Processor } from '@nestjs/bull';
import { TokenMarketsRepository } from '../../cw20-token/repositories/token-markets.repository';
import { Logger } from '@nestjs/common';
import { Queue } from 'bull';
import { COIN_MARKET_CAP_API, GECKOTERMINAL_API, QUEUES, TokenMarkets } from '../../../shared';
import * as appConfig from '../../../shared/configs/configuration';
import * as util from 'util';
import { InfluxDBClient } from '../../metric/services/influxdb-client';
import { ServiceUtil } from '../../../shared/utils/service.util';
import { In } from 'typeorm';

@Processor(QUEUES.TOKEN.QUEUE_NAME)
export class TokenProcessor {
  private readonly logger = new Logger(TokenProcessor.name);
  private influxDbClient: InfluxDBClient;
  private appParams: any;

  constructor(
    private serviceUtil: ServiceUtil,
    private tokenMarketsRepository: TokenMarketsRepository,
    @InjectQueue(QUEUES.TOKEN.QUEUE_NAME) private readonly tokenQueue: Queue,
  ) {
    this.logger.log(
      '============== Constructor Token Price Processor Service ==============',
    );
    this.appParams = appConfig.default();

    this.tokenQueue.add(
      QUEUES.TOKEN.JOB_SYNC_TOKEN_PRICE,
      {},
      {
        repeat: { cron: this.appParams.priceTimeSync },
      },
    );

    this.tokenQueue.add(
      QUEUES.TOKEN.JOB_SYNC_CW20_PRICE,
      {},
      {
        repeat: { cron: this.appParams.priceTimeSync },
      },
    );

    // Connect influxdb
    this.connectInfluxdb();
  }

  @Process(QUEUES.TOKEN.JOB_SYNC_TOKEN_PRICE)
  async syncAuraTokenPrice(): Promise<void> {
    try {
      const geckoTerminal = this.appParams.geckoterminal.api;

      const token = await this.tokenMarketsRepository.findOne({
        where: {
          coin_id: 'aura-network',
        },
      });

      const para = `${util.format(
        GECKOTERMINAL_API.GET_TOKEN_PRICE,
        this.appParams.geckoterminal.pool,
        this.appParams.geckoterminal.coinAddress,
      )}`;

      const response = await this.serviceUtil.getDataAPI(
        geckoTerminal.API,
        para,
        '',
      );
      if (response?.data?.attributes && token) {
        const attributes = response.data.attributes;
        token.current_price = attributes?.base_token_price_usd;
        token.fully_diluted_valuation = attributes?.fdv_usd;
        token.market_cap = attributes?.market_cap_usd;
        token.price_change_percentage_24h =
          attributes?.price_change_percentage.h24;
        token.total_volume = attributes?.volume_usd.h24;

        await this.tokenMarketsRepository.save(token);

        const coinMarkets: TokenMarkets[] = [];
        coinMarkets.push(token);
        this.logger.log(`============== Write data to Influxdb ==============`);
        await this.influxDbClient.writeBlockTokenPriceAndVolume(coinMarkets);
        this.logger.log(
          `============== Write data to Influxdb  successfully ==============`,
        );
      }
    } catch (err) {
      this.logger.error(`sync-aura-token has error: ${err.message}`, err.stack);
    }
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

  connectInfluxdb() {
    this.logger.log(
      `============== call connectInfluxdb method ==============`,
    );
    try {
      this.influxDbClient = new InfluxDBClient(
        this.appParams.influxdb.bucket,
        this.appParams.influxdb.org,
        this.appParams.influxdb.url,
        this.appParams.influxdb.token,
      );
      if (this.influxDbClient) {
        this.influxDbClient.initWriteApi();
      }
    } catch (err) {
      this.logger.log(
        `call connectInfluxdb method has error: ${err.message}`,
        err.stack,
      );
    }
  }

  async handleSyncPriceVolume(listTokens: string[]): Promise<void> {
    try {
      if (this.appParams.priceHostSync === 'COIN_MARKET_CAP') {
        await this.syncCoinMarketCapPrice(listTokens);
      } else {
        await this.syncCoingeckoPrice(listTokens);
      }
    } catch (err) {
      this.logger.log(`sync-price-volume has error: ${err.message}`, err.stack);
      // Reconnect influxDb
      const errorCode = err?.code || '';
      if (errorCode === 'ECONNREFUSED' || errorCode === 'ETIMEDOUT') {
        this.connectInfluxdb();
      }
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
      'X-CMC_PRO_API_KEY': this.appParams.COIN_MARKET_CAP.API_KEY,
    };

    const [response, tokenInfos] = await Promise.all([
      this.serviceUtil.getDataAPIWithHeader(
        coinMarketCap.API,
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
          tokenInfo = SyncDataHelpers.updateCoinMarketsData(tokenInfo, data);
          coinMarkets.push(tokenInfo);
        }
      }
    }
    if (coinMarkets.length > 0) {
      await this.tokenMarketsRepository.save(coinMarkets);

      this.logger.log(`============== Write data to Influxdb ==============`);
      await this.influxDbClient.writeBlockTokenPriceAndVolume(coinMarkets);
      this.logger.log(
        `============== Write data to Influxdb  successfully ==============`,
      );
    }
  }

  async syncCoingeckoPrice(listTokens) {
    const coingecko = this.appParams.COINGECKO;
    this.logger.log(`============== Call Coingecko Api ==============`);
    const coinIds = listTokens.join(',');
    const coinMarkets: TokenMarkets[] = [];

    const para = `${util.format(
      COINGECKO_API.GET_COINS_MARKET,
      coinIds,
      coingecko.MAX_REQUEST,
    )}`;

    const [response, tokenInfos] = await Promise.all([
      this.serviceUtil.getDataAPI(coingecko.API, para, ''),
      this.tokenMarketsRepository.find({
        where: {
          coin_id: In(listTokens),
        },
      }),
    ]);

    if (response) {
      for (let index = 0; index < response.length; index++) {
        const data = response[index];
        let tokenInfo = tokenInfos?.find((f) => f.coin_id === data.id);
        if (tokenInfo) {
          tokenInfo = SyncDataHelpers.updateTokenMarketsData(tokenInfo, data);
          coinMarkets.push(tokenInfo);
        }
      }
    }
    if (coinMarkets.length > 0) {
      await this.tokenMarketsRepository.update(coinMarkets);

      this.logger.log(`============== Write data to Influxdb ==============`);
      await this.influxDbClient.writeBlockTokenPriceAndVolume(coinMarkets);
      this.logger.log(
        `============== Write data to Influxdb  successfully ==============`,
      );
    }
  }
}
