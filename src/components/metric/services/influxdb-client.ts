import {
  InfluxDB,
  Point,
  QueryApi,
  WriteApi,
} from '@influxdata/influxdb-client';
import { number } from 'joi';
import { TokenOutput } from '../dtos/token-output.dto';

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

  closeWriteApi(): void {
    this.writeApi.close().then(() => {
      return;
    });
  }

  queryData(measurement, statTime, step) {
    const results: {
      count: string;
      timestamp: string;
    }[] = [];
    const query = `from(bucket: "${this.bucket}") |> range(start: ${statTime}) |> filter(fn: (r) => r._measurement == "${measurement}") |> window(every: ${step}) |> count()`;
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

  writeBlock(height, block_hash, num_txs, chainid, timestamp): void {
    const point = new Point('blocks')
      .tag('chainid', chainid)
      .stringField('block_hash', block_hash)
      .intField('height', height)
      .intField('num_txs', num_txs)
      .timestamp(this.convertDate(timestamp));
    this.writeApi.writePoint(point);
  }

  writeTx(tx_hash, height, type, timestamp): void {
    const point = new Point('txs')
      // .tag('chainid', chainid)
      .stringField('tx_hash', tx_hash)
      .intField('height', height)
      .stringField('type', type)
      .timestamp(this.convertDate(timestamp));
    this.writeApi.writePoint(point);
  }

  private convertDate(timestamp: any): Date {
    return new Date(timestamp.toString());
  }

  writeValidator(operator_address, title, jailed, power): void {
    const point = new Point('validators')
      .stringField('operator_address', operator_address)
      .stringField('title', title)
      .stringField('jailed', jailed)
      .intField('power', power);
    this.writeApi.writePoint(point);
  }

  writeDelegation(
    delegator_address,
    validator_address,
    shares,
    amount,
    tx_hash,
    created_at,
    type,
  ): void {
    const point = new Point('delegation')
      .stringField('delegator_address', delegator_address)
      .stringField('validator_address', validator_address)
      .stringField('shares', shares)
      .stringField('amount', amount)
      .stringField('tx_hash', tx_hash)
      .stringField('created_at', created_at)
      .stringField('type', type);
    this.writeApi.writePoint(point);
  }

  writeMissedBlock(validator_address, height): void {
    const point = new Point('delegation')
      .stringField('validator_address', validator_address)
      .stringField('height', height);
    this.writeApi.writePoint(point);
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
    const query = ` from(bucket: "${this.bucket}") |> range(start: ${start}) |> filter(fn: (r) => r._measurement == "blocks_measurement") |> filter(fn: (r) => r["_field"] == "num_txs")|> sum()`;
    return this.bindingData(query);
  }

  /**
   * Convert result's Influx
   * @param query
   * @returns
   */
  private bindingData(query: String): Promise<any> {
    const results: {
      total: string;
      timestamp: string;
    }[] = [];

    const output = new Promise((resolve) => {
      this.queryApi.queryRows(query, {
        next(row, tableMeta) {
          const o = tableMeta.toObject(row);
          let date = new Date(o._stop);
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
   * Get token by coin id
   * @param measurement 
   * @param start 
   * @param step 
   * @param coinId 
   * @returns 
   */
  getTokenByCoinId(
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
        |> pivot(rowKey:["_time"], columnKey:["_field"], valueColumn:"_value")
        |> drop(columns:["_value"])
        |> filter(fn: (r) => r.coinId == "${coinId}")
        |> window(every: ${step}, createEmpty: true, timeColumn: "_time")
        |> last(column: "_time")
        |> map(fn: (r) => ({
            coinId: r.coinId,
            current_price: r.current_price,
            max_supply: r.max_supply,
            circulating_supply: r.circulating_supply,
            total_volume: r.total_volume,
            current_holder: r.current_holder,
            current_holder: r.current_holder,
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
          tokenOutput.max_supply = Number(output.max_supply) || 0;
          tokenOutput.total_volume = Number(output.total_volume) || 0;
          tokenOutput.market_cap = Number(output.market_cap) || 0;
          tokenOutput.price_change_percentage_24h = Number(output.price_change_percentage_24h) || 0;
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
}
