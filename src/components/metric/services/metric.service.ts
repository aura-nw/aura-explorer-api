import { Injectable } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import {
  InfluxDB,
  Point,
  QueryApi,
  WriteApi,
} from '@influxdata/influxdb-client';
import { BlockRepository } from '../../block/repositories/block.repository';
import { MetricOutput } from '../dtos/metric-output.dto';
import {
  buildCondition,
  generateSeries,
  mergeByProperty,
} from '../utils/utils';
import { Range } from '../utils/enum';
import { TransactionRepository } from '../../transaction/repositories/transaction.repository';
import { InfluxDBClient } from 'src/components/schedule/services/influxdb-client';
import { AkcLogger, RequestContext } from 'src/shared';
import { ConfigService } from '@nestjs/config';

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

    return await this.queryInfluxDb(range, 'txs');
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
