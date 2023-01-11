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
    maxDate: Date = undefined,
    range: Range,
    coinId: string,
  ): Promise<TokenOutput[]> {
    this.logger.log(ctx, `${this.getTokenInfo.name} was called!`);
    const { step, fluxType, amount } = buildCondition(range);
    const queryStep = `${step}${fluxType}`;

    const value = range === Range.minute ? amount - 3 : amount - 1;
    let currentDate = new Date();
    if (maxDate) {
      currentDate = this.getLastDate(moment(maxDate).toDate(), range);
      // value = value * 2;
    }
    const { start, stop } = this.createRange(currentDate, value, range);

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
    if (range === Range.minute) {
      const length = output?.length || 0;
      for (let i = 0; i < length; i++) {
        const item = output[i];
        let tokenOutput = new TokenOutput();
        tokenOutput = { ...item };
        metricData.push(tokenOutput);
        const currentTime = new Date();
        currentTime.setSeconds(0, 0);
        if (!maxDate) {
          if (new Date(item.timestamp) < currentTime && i == length - 1) {
            const cloneItem = { ...item };
            cloneItem.timestamp =
              moment(currentTime).utc().format('YYYY-MM-DDTHH:mm:00.00') + 'Z';
            metricData.push(cloneItem);
          }
        }
      }
    } else {
      const uctHours = (new Date().getTimezoneOffset() / 60) * -1;
      const series = generateSeries(currentDate, range, uctHours);
      if (output.length > 0) {
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
    }

    this.logger.log(ctx, `${this.getTokenInfo.name} end call!`);
    return metricData;
  }

  async getTokenMarketInfo(ctx: RequestContext, coinId: string) {
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
        start = utcDate.add(-amount, 'd').format('YYYY-MM-DDT00:00:00.000');
        break;
      case Range.month:
        start = utcDate.add(-amount, 'M').format('YYYY-MM-01T00:00:00.000');
        break;
      case Range.hour:
        start = utcDate.add(-amount, 'h').format('YYYY-MM-DDTHH:00:00.000');
        break;
      default:
        start = utcDate.add(-amount, 'm').format('YYYY-MM-DDTHH:mm:00.000');
        break;
    }

    return { start: start + 'Z', stop };
  }

  /**
   * Determine the last date to get data from influxdb
   * @param date
   * @param range
   * @returns
   */
  getLastDate(date: Date, range: Range) {
    const lastDate = new Date(date.toISOString());
    const minute = 59,
      second = 59;
    switch (range) {
      case Range.month:
        lastDate.setMonth(lastDate.getMonth() - 1);
        break;
      case Range.day:
        lastDate.setDate(lastDate.getDate() - 1);
        lastDate.setHours(23, minute, second);
        break;
      case Range.hour:
        lastDate.setHours(lastDate.getHours() - 1, minute, second);
        break;
      default:
        lastDate.setMinutes(lastDate.getMinutes() - 3, second);
        break;
    }
    return lastDate;
  }
}
