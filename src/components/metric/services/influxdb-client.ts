import { InfluxDB, Point, QueryApi, WriteApi } from "@influxdata/influxdb-client";

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
    this.client = new InfluxDB({ url, token, timeout:60000 });
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
      count: string,
      timestamp: string
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

  writeDelegation(delegator_address, validator_address, shares, amount, tx_hash, created_at, type): void {
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
  sumData(measurement: string, start: string, step: string, column: string, timezone: number) {
    const query = ` from(bucket: "${this.bucket}") |> range(start: ${start}) |> filter(fn: (r) => r._measurement == "${measurement}") |> filter(fn: (r) => r["_field"] == "${column}") |> window(every: ${step}, offset: ${timezone}h) |> sum()`;
    return this.bindingData(query);
  }

  /**
   * Get number transactions
   * @param start 
   * @returns 
   */
  getNumberTransactions(start: string){
    const query = ` from(bucket: "${this.bucket}") |> range(start: ${start}) |> filter(fn: (r) => r._measurement == "blocks_measurement") |> filter(fn: (r) => r["_field"] == "num_txs")|> sum()`;
    return this.bindingData(query);
  }

  /**
   * Convert result's Influx
   * @param query 
   * @returns 
   */
  private bindingData(query: String): Promise<any>{
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
}