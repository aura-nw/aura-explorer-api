import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as moment from 'moment';
import { AkcLogger, RequestContext } from '../../../shared';
import { MetricOutput } from '../dtos/metric-output.dto';
import { TokenOutput } from '../dtos/token-output.dto';
import { Range, RangeType } from '../utils/enum';
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
    this.connectInfluxDB();
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
    min: number,
    max: number,
    rangeType: RangeType,
    coinId: string,
  ): Promise<TokenOutput[]> {
    try {
      this.logger.log(ctx, `${this.getTokenInfo.name} was called!`);
      // const { step, fluxType, amount } = buildCondition(range);
      const range = rangeType === RangeType.minute ? 3 : 1;
      const queryStep = `${range}${rangeType}`;
      const minDate = new Date(min),
        maxDate = new Date(max);

      const { start, stop } = this.createRange(minDate, maxDate, rangeType);

      this.logger.log(
        ctx,
        `${this.getTokenInfo.name} call method from influxdb, start: ${start}, stop: ${stop}`,
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
      if (rangeType === RangeType.minute) {
        const length = output?.length || 0;
        for (let i = 0; i < length; i++) {
          const item = output[i];
          let tokenOutput = new TokenOutput();
          tokenOutput = { ...item };
          metricData.push(tokenOutput);
          const currentTime = maxDate;
          currentTime.setSeconds(0, 0);
          if (new Date(item.timestamp) < currentTime && i == length - 1) {
            const cloneItem = { ...item };
            cloneItem.timestamp =
              moment(currentTime).utc().format('YYYY-MM-DDTHH:mm:00.00') + 'Z';
            metricData.push(cloneItem);
          }
        }
      } else {
        if (output.length > 0) {
          metricData.push(...output);
        }
      }

      this.logger.log(ctx, `${this.getTokenInfo.name} end call!`);
      return metricData;
    } catch (err) {
      this.logger.log(ctx, `${this.getTokenInfo.name} has error: ${err.stack}`);
      this.reconnectInfluxdb(err);
      throw err;
    }
  }

  async getTokenMarketInfo(ctx: RequestContext, coinId: string) {
    try {
      const output = (await this.influxDbClient.getTokenMarketInfo(
        'token_cw20_measurement',
        '-1h',
        '1h',
        coinId,
      )) as TokenOutput[];

      let metricData = new TokenOutput();
      if (output.length > 0) {
        metricData = { ...output[0] };
      }

      return metricData;
    } catch (err) {
      this.logger.log(
        ctx,
        `${this.getTokenMarketInfo.name} has error: ${err.stack}`,
      );
      this.reconnectInfluxdb(err);
      throw err;
    }
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
  createRange(minDate: Date, maxDate: Date, rangeType: RangeType) {
    let start = '',
      formatDate = '';

    const utcDate = moment(minDate).utc();
    const stop = maxDate.toISOString();
    const compareDate = moment(maxDate).utc();
    switch (rangeType) {
      case RangeType.day:
        compareDate.add(-365, 'd'); // Value of 1 year
        formatDate = 'YYYY-MM-DDT00:00:00.000';
        break;
      case RangeType.month:
        compareDate.add(-60, 'M'); // Value of 5 year
        formatDate = 'YYYY-MM-01T00:00:00.000';
        break;
      case RangeType.hour:
        compareDate.add(-720, 'h'); // Value of 30 day
        formatDate = 'YYYY-MM-DDTHH:00:00.000';
        break;
      default:
        compareDate.add(-1440, 'm'); // Value of 24 hourse
        formatDate = 'YYYY-MM-DDTHH:mm:00.000';
        break;
    }
    if (utcDate.toDate() > compareDate.toDate()) {
      start = utcDate.format(formatDate);
    } else {
      start = compareDate.format(formatDate);
    }

    return { start: start + 'Z', stop };
  }

  /**
   * Determine the last date to get data from influxdb
   * @param date
   * @param range
   * @returns
   */
  getLastDate(date: Date, rangeType: RangeType) {
    const lastDate = new Date(date.toISOString());
    const minute = 59,
      second = 59;
    switch (rangeType) {
      case RangeType.month:
        lastDate.setMonth(lastDate.getMonth() - 1);
        break;
      case RangeType.day:
        lastDate.setDate(lastDate.getDate() - 1);
        lastDate.setHours(23, minute, second);
        break;
      case RangeType.hour:
        lastDate.setHours(lastDate.getHours() - 1, minute, second);
        break;
      default:
        lastDate.setMinutes(lastDate.getMinutes() - 3, second);
        break;
    }
    return lastDate;
  }

  /**
   * Setting connection to Influxdb
   */
  connectInfluxDB() {
    this.influxDbClient = new InfluxDBClient(
      this.configService.get<string>('influxdb.bucket'),
      this.configService.get<string>('influxdb.org'),
      this.configService.get<string>('influxdb.url'),
      this.configService.get<string>('influxdb.token'),
    );
    this.influxDbClient.initQueryApi();
  }

  /**
   * Reconnect Influxdb
   * @param error
   */
  reconnectInfluxdb(error: any) {
    const errorCode = error?.code || '';
    if (errorCode === 'ECONNREFUSED' || errorCode === 'ETIMEDOUT') {
      this.connectInfluxDB();
    }
  }
}
