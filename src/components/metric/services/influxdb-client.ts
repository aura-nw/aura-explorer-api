import {
  InfluxDB,
  Point,
  QueryApi,
  WriteApi,
} from '@influxdata/influxdb-client';
import { TokenOutput } from '../dtos/token-output.dto';
import { TokenMarkets } from '../../../shared';

export class InfluxDBClient {
  private client: InfluxDB;
  private queryApi: QueryApi;
  private writeApi: WriteApi;

  constructor(
    public bucket: string,
    public org: string,
    public url: string,
    public token: string,
  ) {
    this.client = new InfluxDB({ url, token, timeout: 60000 });
  }

  initQueryApi(): void {
    this.queryApi = this.client.getQueryApi(this.org);
  }

  initWriteApi(): void {
    this.writeApi = this.client.getWriteApi(this.org, this.bucket);
    return;
  }

  queryData(measurement, statTime, step) {
    const results: {
      count: string;
      timestamp: string;
    }[] = [];
    const query = `from(bucket: "${this.bucket}") |> range(start: ${statTime}) |> filter(fn: (r) => r._measurement == "${measurement}") |> window(every: ${step}) |> count()`;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const output = new Promise((resolve, reject) => {
      this.queryApi.queryRows(query, {
        next(row, tableMeta) {
          const o = tableMeta.toObject(row);
          results.push({
            timestamp: o._start,
            count: String(o._value),
          });
        },
        error(error) {
          console.error(error);
          console.log('Finished ERROR');
          return resolve(results);
        },
        complete() {
          console.log('Finished SUCCESS');
          return resolve(results);
        },
      });
    });
    return output;
  }

  /**
   * Sum data by column
   * @param measurement
   * @param statTime
   * @param step
   * @param column
   * @returns
   */
  sumData(measurement: string, start: string, step: string, column: string) {
    const query = ` from(bucket: "${this.bucket}") |> range(start: ${start}) |> filter(fn: (r) => r._measurement == "${measurement}") |> filter(fn: (r) => r["_field"] == "${column}") |> window(every: ${step}) |> sum()`;
    return this.bindingData(query);
  }

  /**
   * Sum data by column with timezone (in hour)
   * @param measurement
   * @param statTime
   * @param step
   * @param column
   * @param offsetInHours
   * @returns
   */
  sumDataWithTimezoneOffset(
    measurement: string,
    start: string,
    step: string,
    column: string,
    withTimezone = true,
    offsetInHours = 0,
  ) {
    if (withTimezone) {
      const query = `
        from(bucket: "${this.bucket}")
          |> range(start: ${start})
          |> filter(fn: (r) => r._measurement == "${measurement}")
          |> filter(fn: (r) => r["_field"] == "${column}")
          |> aggregateWindow(every: 1h, timeSrc: "_start", fn: sum)
          |> timeShift(duration: ${-offsetInHours}h)
          |> window(every: ${step}, createEmpty: true)
          |> timeShift(duration: ${offsetInHours}h)
          |> sum()`;
      return this.bindingData(query);
    }
    const query = `
      from(bucket: "${this.bucket}")
        |> range(start: ${start})
        |> filter(fn: (r) => r._measurement == "${measurement}")
        |> filter(fn: (r) => r["_field"] == "${column}")
        |> window(every: ${step}, createEmpty: true)
        |> sum()`;
    return this.bindingData(query);
  }

  /**
   * Get number transactions
   * @param start
   * @returns
   */
  getNumberTransactions(start: string) {
    const query = ` from(bucket: "${this.bucket}")
        |> range(start: ${start})
        |> filter(fn: (r) => r._measurement == "blocks_measurement")
        |> filter(fn: (r) => r["_field"] == "num_txs")
        |> group(columns: ["_measurement"])
        |> sum()`;
    return this.bindingData(query);
  }

  /**
   * Convert result's Influx
   * @param query
   * @returns
   */
  private bindingData(query: string): Promise<any> {
    const results: {
      total: string;
      timestamp: string;
    }[] = [];

    const output = new Promise((resolve) => {
      this.queryApi.queryRows(query, {
        next(row, tableMeta) {
          const o = tableMeta.toObject(row);
          const date = new Date(o._stop);
          date.setMinutes(0, 0, 0);
          results.push({
            timestamp: o._start,
            total: String(o._value),
          });
        },
        error(error) {
          console.error(error);
          console.log('Finished ERROR');
          return resolve(results);
        },
        complete() {
          console.log('Finished SUCCESS');
          return resolve(results);
        },
      });
    });
    return output;
  }

  /**
   * Get market info of token
   * @param measurement
   * @param start
   * @param step
   * @param coinId
   * @returns
   */
  getTokenMarketInfo(
    measurement: string,
    start: string,
    step: string,
    coinId: string,
  ): Promise<any> {
    const results: Array<TokenOutput> = [];
    const query = `
      import "date"
      from(bucket: "${this.bucket}")
        |> range(start: ${start})
        |> filter(fn: (r) => r._measurement == "${measurement}")
        |> filter(fn: (r) => r["token_id"]== "${coinId}")
        |> last(column: "_start")
        |> pivot(rowKey:["_time"], columnKey:["_field"], valueColumn:"_value")
        |> drop(columns:["_value"])
        |> last(column: "_start")
        |> map(fn: (r) => ({
            coinId: r.coinId,
            current_price: r.current_price,
            total_volume: r.total_volume,
            market_cap: r.market_cap,
            price_change_percentage_24h: r.price_change_percentage_24h,
            time: date.truncate(t: r._start, unit: ${step})
        }))`;
    const output = new Promise((resolve) => {
      this.queryApi.queryRows(query, {
        next(row, tableMeta) {
          const output = tableMeta.toObject(row);
          const tokenOutput = new TokenOutput();
          tokenOutput.timestamp = output.time;
          tokenOutput.coinId = String(output.coinId);
          tokenOutput.current_price = Number(output.current_price) || 0;
          tokenOutput.total_volume = Number(output.total_volume) || 0;
          tokenOutput.market_cap = Number(output.market_cap) || 0;
          tokenOutput.price_change_percentage_24h =
            Number(output.price_change_percentage_24h) || 0;
          results.push(tokenOutput);
        },
        error(error) {
          console.error(error);
          console.log('Finished ERROR');
          return resolve(results);
        },
        complete() {
          console.log('Finished SUCCESS');
          return resolve(results);
        },
      });
    });
    return output;
  }

  /**
   * Get token info
   * @param measurement
   * @param start
   * @param step
   * @param coinId
   * @returns
   */
  getTokenInfo(
    measurement: string,
    start: string,
    stop: string,
    step: string,
    coinId: string,
  ): Promise<any> {
    const results: Array<TokenOutput> = [];
    const query = `
      import "date"
      from(bucket: "${this.bucket}")
        |> range(start:${start}, stop:${stop})
        |> filter(fn: (r) => r._measurement == "${measurement}")
        |> filter(fn: (r) => r["token_id"]== "${coinId}")
        |> filter(fn: (r) => r["_field"]== "coinId"
            or r["_field"]== "current_price"
            or r["_field"]== "price_change_percentage_24h"
            or r["_field"]== "total_volume"
        )
        |> pivot(rowKey:["_time"], columnKey:["_field"], valueColumn:"_value")
        |> drop(columns:["_value"])
        |> window(every: ${step}, createEmpty: true, timeColumn: "_time")
        |> last(column: "_start")
        |> map(fn: (r) => ({
            coinId: r.coinId,
            current_price: r.current_price,
            price_change_percentage_24h: r.price_change_percentage_24h,
            total_volume: r.total_volume,
            time: date.truncate(t: r._start, unit: ${step})
        }))`;

    console.log(query);

    const output = new Promise((resolve) => {
      this.queryApi.queryRows(query, {
        next(row, tableMeta) {
          const output = tableMeta.toObject(row);
          const tokenOutput = new TokenOutput();
          tokenOutput.timestamp = output.time;
          tokenOutput.coinId = String(output.coinId);
          tokenOutput.current_price = Number(output.current_price) || 0;
          tokenOutput.total_volume = Number(output.total_volume) || 0;
          tokenOutput.price_change_percentage_24h =
            Number(output.price_change_percentage_24h) || 0;
          results.push(tokenOutput);
        },
        error(error) {
          console.error(error);
          console.log('Finished ERROR');
          return resolve(results);
        },
        complete() {
          console.log('Finished SUCCESS');
          return resolve(results);
        },
      });
    });
    return output;
  }

  async writeBlockTokenPriceAndVolume(tokens: TokenMarkets[]) {
    const points: Array<Point> = [];
    tokens.forEach((token) => {
      const point = new Point('token_cw20_measurement')
        .tag('token_id', token.coin_id)
        .stringField('coinId', token.coin_id)
        .stringField('type', 'CW20')
        .stringField('last_updated', token.updated_at)
        .floatField('current_price', token.current_price)
        .floatField(
          'price_change_percentage_24h',
          token.price_change_percentage_24h,
        )
        .floatField('total_volume', token.total_volume)
        .floatField('circulating_supply', token.circulating_supply)
        .floatField('circulating_market_cap', token.circulating_market_cap)
        .floatField('max_supply', token.max_supply)
        .floatField('market_cap', token.market_cap)
        // .intField('current_holder', token.current_holder)
        // .floatField('percent_hold', token.holder_change_percentage_24h)
        .timestamp(this.convertDate(token.updated_at));
      points.push(point);
    });

    if (points.length > 0) {
      this.writeApi.writePoints(points);
      await this.writeApi.flush();
    }
  }

  /**
   * convertDate
   * @param timestamp
   * @returns
   */
  convertDate(timestamp: any): Date {
    const strTime = String(timestamp);
    const idx = strTime.lastIndexOf('.');
    const dateConvert =
      idx > -1 ? strTime.substring(0, idx) + '.000Z' : strTime;
    return new Date(dateConvert);
  }
}
