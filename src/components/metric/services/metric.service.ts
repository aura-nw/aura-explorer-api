import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InfluxDBClient } from '../../../components/schedule/services/influxdb-client';
import { AkcLogger, RequestContext } from '../../../shared';
import { BlockRepository } from '../../block/repositories/block.repository';
import { TransactionRepository } from '../../transaction/repositories/transaction.repository';
import { ValidatorRepository } from '../../validator/repositories/validator.repository';
import { MetricOutput } from '../dtos/metric-output.dto';
import { Range } from '../utils/enum';
import {
  buildCondition,
  generateSeries,
  mergeByProperty
} from '../utils/utils';

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
  ): Promise<MetricOutput[]> {
    this.logger.log(ctx, `${this.getTransaction.name} was called!`);
    this.logger.log(
      ctx,
      `calling ${TransactionRepository.name}.createQueryBuilder`,
    );
    const { amount, step, fluxType } = buildCondition(range);
    const startTime = `-${amount}${fluxType}`;
    const queryStep = `${step}${fluxType}`;
    const metricData = await this.influxDbClient.sumData('blocks', startTime, queryStep, 'num_txs') as MetricOutput[];
    const series = generateSeries(range);

    return mergeByProperty(metricData, series);;
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

  private async queryInfluxDb(
    range: Range,
    measurement: string,
  ): Promise<MetricOutput[]> {
    const { amount, step, fluxType } = buildCondition(range);
    const startTime = `-${amount}${fluxType}`;
    const queryStep = `${step}${fluxType}`;
    const data = (await this.influxDbClient.queryData(measurement, startTime, queryStep)) as MetricOutput[];
    const series = generateSeries(range);
    return mergeByProperty(data, series);
  }
}
