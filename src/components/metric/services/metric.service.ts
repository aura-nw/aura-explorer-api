import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AkcLogger, RequestContext } from '../../../shared';
import { BlockRepository } from '../../block/repositories/block.repository';
import { ValidatorRepository } from '../../validator/repositories/validator.repository';
import { MetricOutput } from '../dtos/metric-output.dto';
import { TokenOutput } from '../dtos/token-output.dto';
import { Range } from '../utils/enum';
import {
  buildCondition,
  generateSeries,
  makeupData,
  mergeByProperty
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

  async getBlock(ctx: RequestContext, range: Range): Promise<MetricOutput[]> {
    this.logger.log(ctx, `${this.getBlock.name} was called!`);
    this.logger.log(ctx, `calling ${BlockRepository.name}.createQueryBuilder`);

    return await this.queryInfluxDb(range, 'blocks');
  }

  async getTransaction(
    ctx: RequestContext,
    range: Range,
    timezoneOffset: number,
  ): Promise<MetricOutput[]> {
    this.logger.log(ctx, `${this.getTransaction.name} was called!`);

    const { amount, step, fluxType } = buildCondition(range);
    const startTime = `-${amount}${fluxType}`;
    const queryStep = `${step}${fluxType}`;

    const withTimezone = [Range.day, Range.month].includes(range);
    const offsetInHours = Math.round(timezoneOffset / 60);

    const metricData = (await this.influxDbClient.sumDataWithTimezoneOffset(
      'blocks_measurement',
      startTime,
      queryStep,
      'num_txs',
      withTimezone,
      offsetInHours,
    )) as MetricOutput[];
    return makeupData(metricData, amount);
  }

  async getValidator(
    ctx: RequestContext,
    range: Range,
  ): Promise<MetricOutput[]> {
    this.logger.log(ctx, `${this.getValidator.name} was called!`);
    this.logger.log(
      ctx,
      `calling ${ValidatorRepository.name}.createQueryBuilder`,
    );

    return await this.queryInfluxDb(range, 'validators');
  }

  /**
   * Get token data by coid id
   * @param ctx 
   * @param coinId 
   * @param range 
   * @returns 
   */
  async getTokenByCoinId(
    ctx: RequestContext,
    coinId: string,
    range: Range,
  ): Promise<any[]> {
    this.logger.log(ctx, `${this.getTokenByCoinId.name} was called!`);

    const { amount, step, fluxType } = buildCondition(range);
    const startTime = `-${amount}${fluxType}`;
    const queryStep = `${step}${fluxType}`;

    this.logger.log(ctx, `${this.getTokenByCoinId.name} call method from influxdb!`);
    const output = await this.influxDbClient.getTokenByCoinId(
      'token_cw20_measurement',
      startTime,
      queryStep,
      coinId
    ) as TokenOutput[];

    this.logger.log(ctx, `${this.getTokenByCoinId.name} generation data!`);
    const metricData: TokenOutput[] = [];
    const length = output?.length || 0;
    for (let i = 0; i < length; i++) {
      const item = output[i];
      let tokenOutput = new TokenOutput();
      tokenOutput = { ...item };
      metricData.push(tokenOutput);
      if (range === Range.minute) {
        const currentTime = new Date();
        currentTime.setSeconds(0, 0);
        if (new Date(item.timestamp) < currentTime && i == (length - 1)) {
          const cloneItem = { ...item };
          cloneItem.timestamp = currentTime.toUTCString();
          metricData.push(cloneItem);
        }
      }
    }

    this.logger.log(ctx, `${this.getTokenByCoinId.name} end call!`);
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
    const series = generateSeries(range);
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
}
