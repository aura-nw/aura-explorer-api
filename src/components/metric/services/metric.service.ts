import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as moment from 'moment';
import { AkcLogger, RequestContext } from '../../../shared';
import { MetricOutput } from '../dtos/metric-output.dto';
import { TokenOutput } from '../dtos/token-output.dto';
import { Range } from '../utils/enum';
import {
  buildCondition,
  generateSeries,
  mergeByProperty,
} from '../utils/utils';
import { InfluxDBClient } from './influxdb-client';

@Injectable()
export class MetricService {
  influxDbClient: InfluxDBClient;

  constructor(
    private readonly logger: AkcLogger,
    private configService: ConfigService,
  ) {
    this.logger.setContext(MetricService.name);
    this.influxDbClient = new InfluxDBClient(
      this.configService.get<string>('influxdb.bucket'),
      this.configService.get<string>('influxdb.org'),
      this.configService.get<string>('influxdb.url'),
      this.configService.get<string>('influxdb.token'),
    );
    this.influxDbClient.initQueryApi();
  }

  /**
   * Get token info
   * @param ctx
   * @param coinId
   * @param range
   * @returns
   */
  async getTokenInfo(
    ctx: RequestContext,
    minDate: Date = undefined,
    range: Range,
    coinId: string,
  ): Promise<TokenOutput[]> {
    this.logger.log(ctx, `${this.getTokenInfo.name} was called!`);
    const { step, fluxType, amount } = buildCondition(range);
    const queryStep = `${step}${fluxType}`;

    let currentDate = new Date();
    if (minDate) {
      currentDate = moment(minDate).toDate();
    }
    const { start, stop } = this.createRange(currentDate, amount, range);

    this.logger.log(
      ctx,
      `${this.getTokenInfo.name} call method from influxdb!`,
    );
    const output = (await this.influxDbClient.getTokenInfo(
      'token_cw20_measurement',
      start,
      stop,
      queryStep,
      coinId,
    )) as TokenOutput[];

    this.logger.log(ctx, `${this.getTokenInfo.name} generation data!`);
    const metricData: TokenOutput[] = [];
    if (range === Range.minute) {
      const length = output?.length || 0;
      for (let i = 0; i < length; i++) {
        const item = output[i];
        let tokenOutput = new TokenOutput();
        tokenOutput = { ...item };
        metricData.push(tokenOutput);
        const currentTime = new Date();
        currentTime.setSeconds(0, 0);
        if (new Date(item.timestamp) < currentTime && i == length - 1) {
          const cloneItem = { ...item };
          cloneItem.timestamp = currentTime.toUTCString();
          metricData.push(cloneItem);
        }
      }
    } else {
      const uctHours = (new Date().getTimezoneOffset() / 60) * -1;
      const series = generateSeries(currentDate, range, uctHours);
      series.forEach((item: MetricOutput) => {
        let tokenOutput = new TokenOutput();
        const find = output.find((f) => f.timestamp === item.timestamp);
        if (find) {
          tokenOutput = { ...find };
        } else {
          tokenOutput.coinId = coinId;
          tokenOutput.timestamp = item.timestamp;
        }
        metricData.push(tokenOutput);
      });
    }

    this.logger.log(ctx, `${this.getTokenInfo.name} end call!`);
    return metricData;
  }

  async getTokenMarketInfo(ctx: RequestContext, coinId: string) {
    const output = (await this.influxDbClient.getTokenMarketInfo(
      'token_cw20_measurement',
      '-1',
      '1h',
      coinId,
    )) as TokenOutput[];

    let metricData = new TokenOutput();
    if (output.length > 0) {
      metricData = { ...output[0] };
    }

    return metricData;
  }

  private async queryInfluxDb(
    range: Range,
    measurement: string,
  ): Promise<MetricOutput[]> {
    const { amount, step, fluxType } = buildCondition(range);
    const startTime = `-${amount}${fluxType}`;
    const queryStep = `${step}${fluxType}`;
    const data = (await this.influxDbClient.queryData(
      measurement,
      startTime,
      queryStep,
    )) as MetricOutput[];
    const series = generateSeries(new Date(), range);
    return mergeByProperty(data, series);
  }

  /**
   * Get the number of transactions
   * @returns MetricOutput[]
   */
  async getNumberTransactions() {
    const start: string = this.configService.get<string>('deploymentDate');
    return (await this.influxDbClient.getNumberTransactions(
      start,
    )) as MetricOutput[];
  }

  /**
   * Create range to get data from influxdb
   * @param date
   * @param format
   * @param amount
   * @param range
   * @returns
   */
  createRange(date: Date, amount: number, range: Range) {
    let start = '';
    const utcDate = moment(date).utc();
    const stop = utcDate.toISOString();
    switch (range) {
      case Range.day:
        start = utcDate.day(-amount).format('YYYY-MM-DDT00:00:00.000');
        break;
      case Range.month:
        start = utcDate.month(-amount).format('YYYY-MM-01T00:00:00.000');
        break;
      case Range.hour:
        start = utcDate.hours(-amount).format('YYYY-MM-DDTHH:00:00.000');
        break;
      default:
        start = utcDate.minutes(-amount).format('YYYY-MM-DDTHH:mm:00.000');
        break;
    }

    return { start: start + 'Z', stop };
  }
}
