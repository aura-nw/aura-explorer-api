import { InfluxDB, Point, WriteApi } from "@influxdata/influxdb-client";

export class InfluxDBClient {
  private client: InfluxDB;
  private writeApi: WriteApi;

  constructor(
    public bucket: string,
    public org: string,
    public url: string,
    public token: string,
  ) {
    this.client = new InfluxDB({ url, token });
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
}