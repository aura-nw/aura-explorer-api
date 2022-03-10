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
import { type } from 'os';

@Injectable()
export class TaskService {
  isSyncing: boolean;
  currentBlock: number;
  influxDbClient: InfluxDBClient;
  cosmosScanAPI: string;

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
    this.cosmosScanAPI = this.configService.get<string>('cosmosScanAPI');
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

  @Interval(500)
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
        const paramsBlock = `block?height=${fetchingBlockHeight}`;

        const blockData = await this.getDataRPC(rpc, paramsBlock);
        // const payloadBlock = {
        //   jsonrpc: '2.0',
        //   id: 1,
        //   method: 'block',
        //   params: [`${fetchingBlockHeight}`],
        // };
        // const blockData = await this.postDataRPC(rpc, payloadBlock);
        // get validators
        const paramsValidator = `/cosmos/staking/v1beta1/validators`;
        const validatorData = await this.getDataAPI(api, paramsValidator);
        
        // get validators by height, page and per_page
        const paramsBlockHeight = `/validators?height=${fetchingBlockHeight}&page=1&per_page=1000`;
        const blockDetailData = await this.getDataRPC(rpc, paramsBlockHeight);

        // TODO: init write api
        this.influxDbClient.initWriteApi();
        // create block
        const newBlock = new Block();
        newBlock.block_hash = blockData.block_id.hash;
        newBlock.chainid = blockData.block.header.chain_id;
        newBlock.height = blockData.block.header.height;
        newBlock.num_txs = blockData.block.data.txs.length;
        newBlock.timestamp = blockData.block.header.time;
        newBlock.round = blockData.block.last_commit.round;

        const operatorAddress = blockData.block.header.proposer_address;
        let blockGasUsed = 0;
        let blockGasWanted = 0;
        let proposerAddress = '';
        // get pub_key of validators
        for (const key in blockDetailData.validators) {
          const data = blockDetailData.validators[key];
          if (data.address === operatorAddress) {
            proposerAddress = data.pub_key.value;
          }
        }

        // set proposer and operator_address from validators
        for (const key in validatorData.validators) {
          const ele = validatorData.validators[key];
          if (ele.consensus_pubkey['key'] === proposerAddress) {
            newBlock.proposer = ele.description.moniker;
            newBlock.operator_address = ele.operator_address;
          }
        }

        if (blockData.block.data.txs && blockData.block.data.txs.length > 0) {
          // create transaction
          for (const key in blockData.block.data.txs) {
            const element = blockData.block.data.txs[key];

            const txHash = sha256(Buffer.from(element, 'base64')).toUpperCase();
            this.logger.log(null, `processing tx: ${txHash}`);

            // fetch tx data
            const paramsTx = `/cosmos/tx/v1beta1/txs/${txHash}`

            const txData = await this.getDataAPI(api, paramsTx);

            let txType = 'FAILED';
            if (txData.tx_response.code === 0) {
              const txLog = JSON.parse(txData.tx_response.raw_log);

              const txAttr = txLog[0].events.find(
                ({ type }) => type === 'message',
              );
              const txAction = txAttr.attributes.find(
                ({ key }) => key === 'action',
              );
              const regex = /_/gi;
              txType = txAction.value.replace(regex, ' ');
            } else {
              const txBody = txData.tx_response.tx.body.messages[0];
              txType = txBody['@type'];
            }
            blockGasUsed += txData.tx_response.gas_used;
            blockGasWanted += txData.tx_response.gas_wanted;
            let savedBlock;
            if (parseInt(key) === blockData.block.data.txs.length -1) {
              newBlock.gas_used = blockGasUsed;
              newBlock.gas_wanted = blockGasWanted;
              try {
                savedBlock = await this.blockRepository.save(newBlock);
              } catch (error) {
                savedBlock = await this.blockRepository.findOne({
                  where: { block_hash: blockData.block_id.hash },
                });
              }
            }
            const newTx = new Transaction();
            const fee = txData.tx_response.tx.auth_info.fee.amount[0];
            const txFee = (fee['amount'] / 1000000).toFixed(5);
            newTx.block = savedBlock;
            newTx.code = txData.tx_response.code;
            newTx.codespace = txData.tx_response.codespace;
            newTx.data =
              txData.tx_response.code === 0 ? txData.tx_response.data : '';
            newTx.gas_used = txData.tx_response.gas_used;
            newTx.gas_wanted = txData.tx_response.gas_wanted;
            newTx.height = fetchingBlockHeight;
            newTx.info = txData.tx_response.info;
            newTx.raw_log = txData.tx_response.raw_log;
            newTx.timestamp = blockData.block.header.time;
            newTx.tx = JSON.stringify(txData.tx_response);
            newTx.tx_hash = txData.tx_response.txhash;
            newTx.type = txType;
            newTx.fee = txFee;
            newTx.messages = txData.tx_response.tx.body.messages;
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
