import { HttpService } from '@nestjs/axios';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Interval } from '@nestjs/schedule';
import { lastValueFrom } from 'rxjs';
import { sha256 } from 'js-sha256';

import { AkcLogger, Block, Transaction, SyncStatus } from '../../../shared';

import { BlockRepository } from '../repositories/block.repository';
import { SyncStatusRepository } from '../repositories/syns-status.repository';
import { TransactionRepository } from '../repositories/transaction.repository';
import { InfluxDBClient } from './influxdb-client';

@Injectable()
export class TaskService {
  isSyncing: boolean;
  currentBlock: number;
  influxDbClient: InfluxDBClient;

  constructor(
    private readonly logger: AkcLogger,
    private httpService: HttpService,
    private configService: ConfigService,
    private statusRepository: SyncStatusRepository,
    private blockRepository: BlockRepository,
    private txRepository: TransactionRepository,
  ) {
    this.logger.setContext(TaskService.name);
    this.isSyncing = false;
    this.getCurrentStatus();

    this.influxDbClient = new InfluxDBClient(
      this.configService.get<string>('influxdb.bucket'),
      this.configService.get<string>('influxdb.org'),
      this.configService.get<string>('influxdb.url'),
      this.configService.get<string>('influxdb.token'),
    );
  }

  async getCurrentStatus() {
    const status = await this.statusRepository.find();
    if (!status[0]) {
      const newStatus = new SyncStatus();
      newStatus.current_block = this.configService.get<number>('startHeight');
      await this.statusRepository.save(newStatus);
      this.currentBlock = this.configService.get<number>('startHeight');
    } else {
      this.currentBlock = status[0].current_block;
    }
  }
  async updateStatus(newHeight) {
    const status = await this.statusRepository.find();
    status[0].current_block = newHeight;
    await this.statusRepository.save(status[0]);
  }

  async getDataAPI(api, params) {
    const data = await lastValueFrom(this.httpService.get(api + params)).then(
      (rs) => rs.data,
    );

    return data;
  }
  async getDataRPC(rpc, params) {
    const data = await lastValueFrom(this.httpService.get(rpc + params)).then(
      (rs) => rs.data,
    );

    if (typeof data.error != 'undefined') {
      throw new InternalServerErrorException();
    }
    if (typeof data.result != 'undefined') {
      return data.result;
    } else {
      return '';
    }
  }
  async postDataRPC(rpc, payload) {
    const data = await lastValueFrom(this.httpService.post(rpc, payload)).then(
      (rs) => rs.data,
    );

    if (typeof data.error != 'undefined') {
      throw new InternalServerErrorException();
    }
    if (typeof data.result != 'undefined') {
      return data.result;
    } else {
      return '';
    }
  }

  @Interval(1000)
  async handleInterval() {
    // check status
    if (this.isSyncing) {
      this.logger.log(null, 'already syncing... wait');
      return;
    } else {
      this.logger.log(null, 'fetching data...');
    }

    const rpc = this.configService.get<string>('node.rpc');
    const api = this.configService.get<string>('node.api');

    // get latest block height
    const payloadStatus = {
      jsonrpc: '2.0',
      id: 1,
      method: 'status',
      params: [],
    };
    const status = await this.postDataRPC(rpc, payloadStatus);
    const latestHeight = status
      ? Number(status.sync_info.latest_block_height)
      : 0;

    // get current synced block
    await this.getCurrentStatus();

    if (latestHeight > this.currentBlock) {
      this.isSyncing = true;
      const fetchingBlockHeight = this.currentBlock + 1;

      this.logger.log(null, `processing block: ${fetchingBlockHeight}`);

      try {
        // fetching block from node
        const payloadBlock = {
          jsonrpc: '2.0',
          id: 1,
          method: 'block',
          params: [`${fetchingBlockHeight}`],
        };
        const blockData = await this.postDataRPC(rpc, payloadBlock);

        // TODO: init write api
        this.influxDbClient.initWriteApi();
        // create block
        const newBlock = new Block();
        newBlock.block_hash = blockData.block_id.hash;
        newBlock.chainid = blockData.block.header.chain_id;
        newBlock.height = blockData.block.header.height;
        newBlock.num_txs = blockData.block.data.txs.length;
        newBlock.proposer = blockData.block.header.proposer_address;
        newBlock.timestamp = blockData.block.header.time;

        if (blockData.block.data.txs && blockData.block.data.txs.length > 0) {
          // create transaction
          for (const key in blockData.block.data.txs) {
            const element = blockData.block.data.txs[key];

            const txHash = sha256(Buffer.from(element, 'base64')).toUpperCase();

            // fetch tx data
            const params = `tx?hash=0x${txHash}&prove=true`;

            const txData = await this.getDataRPC(rpc, params);

            let txType = 'FAILED';
            if (txData.tx_result.code === 0) {
              const txLog = JSON.parse(txData.tx_result.log);

              const txAttr = txLog[0].events.find(
                ({ type }) => type === 'message',
              );
              const txAction = txAttr.attributes.find(
                ({ key }) => key === 'action',
              );
              const regex = /_/gi;
              txType = txAction.value.replace(regex, ' ').toUpperCase();
            }
            let savedBlock;
            try {
              savedBlock = await this.blockRepository.save(newBlock);
            } catch (error) {
              savedBlock = await this.blockRepository.findOne({
                where: { block_hash: blockData.block_id.hash },
              });
            }
            const newTx = new Transaction();
            newTx.block = savedBlock;
            newTx.code = txData.tx_result.code;
            newTx.codespace = txData.tx_result.codespace;
            newTx.data =
              txData.tx_result.code === 0 ? txData.tx_result.data : '';
            newTx.gas_used = txData.tx_result.gas_used;
            newTx.gas_wanted = txData.tx_result.gas_wanted;
            newTx.height = fetchingBlockHeight;
            newTx.info = txData.tx_result.info;
            newTx.raw_log = txData.tx_result.log;
            newTx.timestamp = blockData.block.header.time;
            newTx.tx = txData.tx;
            newTx.tx_hash = txData.hash;
            newTx.type = txType;
            try {
              await this.txRepository.save(newTx);
            } catch (error) {
              this.logger.error(null, `Transaction is already existed!`);
            }
            // TODO: Write tx to influxdb
            this.influxDbClient.writeTx(
              newTx.tx_hash,
              newTx.height,
              newTx.type,
              newTx.timestamp,
            );
          }
        } else {
          try {
            await this.blockRepository.save(newBlock);
          } catch (error) {
            this.logger.error(null, `Block is already existed!`);
          }
          // TODO: Write block to influxdb
          this.influxDbClient.writeBlock(
            newBlock.height,
            newBlock.block_hash,
            newBlock.num_txs,
            newBlock.chainid,
            newBlock.timestamp,
          );
        }
        /**
         * TODO: Flush pending writes and close writeApi.
         */
        this.influxDbClient.closeWriteApi();

        // update current block
        await this.updateStatus(fetchingBlockHeight);
        this.isSyncing = false;
      } catch (error) {
        this.isSyncing = false;
        this.logger.error(null, `${error.name}: ${error.message}`);
        this.logger.error(null, `${error.stack}`);
      }
    }
  }
}
