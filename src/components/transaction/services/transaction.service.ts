import { HttpService } from '@nestjs/axios';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { plainToClass } from 'class-transformer';
import { lastValueFrom } from 'rxjs';

import { AkcLogger, RequestContext, Transaction } from '../../../shared';

import { TxParamsDto } from '../dtos/transaction-params.dto';
import { LiteTransactionOutput } from '../dtos/transaction-output.dto';
import { TransactionRepository } from '../repositories/transaction.repository';

@Injectable()
export class TransactionService {
  constructor(
    private readonly logger: AkcLogger,
    private configService: ConfigService,
    private httpService: HttpService,
    private txRepository: TransactionRepository,
  ) {
    this.logger.setContext(TransactionService.name);
  }

  async getTotalTx(): Promise<number> {
    return await this.txRepository.count();
  }

  async getTxsByBlockHeight(height: number): Promise<Transaction[]> {
    return await this.txRepository.find({ where: { height } });
  }

  async getTxs(
    ctx: RequestContext,
    query: TxParamsDto,
  ): Promise<{ txs: LiteTransactionOutput[]; count: number }> {
    this.logger.log(ctx, `${this.getTxs.name} was called!`);

    // this.logger.log(ctx, `calling get latest txs from node`);
    // const rpc = this.configService.get<string>('node.rpc');

    // // fetch data
    // const txs = [];
    // let lastHeight;

    // // get latest block height
    // const payloadGetBlockHeight = {
    //   jsonrpc: '2.0',
    //   id: 1,
    //   method: 'blockchain',
    //   params: ['0', '0'],
    // };
    // const dataBlockHeight = await lastValueFrom(
    //   this.httpService.post(rpc, payloadGetBlockHeight),
    // ).then((rs) => rs.data);
    // if (typeof dataBlockHeight.error != 'undefined') {
    //   throw new InternalServerErrorException();
    // }
    // if (typeof dataBlockHeight.result != 'undefined') {
    //   lastHeight = dataBlockHeight.result.last_height;
    // }

    // // get tx
    // // loop until tx length = query
    // let blHeight = lastHeight;
    // while (txs.length < query.limit) {
    //   // get block data
    //   let blockTime = dataBlockHeight.result.block_metas[0].header.time;
    //   if (blHeight != lastHeight) {
    //     const payloadGetBlock = {
    //       jsonrpc: '2.0',
    //       id: 1,
    //       method: 'block',
    //       params: [`${blHeight}`],
    //     };
    //     const dataBlock = await lastValueFrom(
    //       this.httpService.post(rpc, payloadGetBlock),
    //     ).then((rs) => rs.data);
    //     if (typeof dataBlock.error != 'undefined') {
    //       throw new InternalServerErrorException();
    //     }
    //     if (typeof dataBlock.result != 'undefined') {
    //       blockTime = dataBlock.result.block.header.time;
    //     }
    //   }

    //   const payloadGetTx = {
    //     jsonrpc: '2.0',
    //     id: 1,
    //     method: 'tx_search',
    //     params: [`tx.height=${blHeight}`, true, '1', '20', 'asc'],
    //   };
    //   const dataTx = await lastValueFrom(
    //     this.httpService.post(rpc, payloadGetTx),
    //   ).then((rs) => rs.data);
    //   if (typeof dataTx.error != 'undefined') {
    //     throw new InternalServerErrorException();
    //   }
    //   if (
    //     typeof dataTx.result != 'undefined' &&
    //     dataTx.result.total_count > 0
    //   ) {
    //     for (const tx of dataTx.result.txs) {
    //       if (tx.tx_result.code === 0) {
    //         const txLog = JSON.parse(tx.tx_result.log);

    //         const txAttr = txLog[0].events.find(
    //           ({ type }) => type === 'message',
    //         );
    //         const txAction = txAttr.attributes.find(
    //           ({ key }) => key === 'action',
    //         );
    //         const regex = /_/gi;
    //         const txType = txAction.value.replace(regex, ' ').toUpperCase();

    //         txs.push({
    //           height: tx.height,
    //           tx_hash: tx.hash,
    //           type: txType,
    //           timestamp: blockTime,
    //         });
    //       } else {
    //         txs.push({
    //           height: tx.height,
    //           tx_hash: tx.hash,
    //           type: '',
    //           timestamp: blockTime,
    //         });
    //       }

    //       if (txs.length === query.limit) break;
    //     }
    //   }

    //   blHeight--;
    // }

    const [txs, count] = await this.txRepository.findAndCount({
      order: { height: 'DESC' },
      take: query.limit,
      skip: query.offset,
    });

    const txsOuput = plainToClass(LiteTransactionOutput, txs, {
      excludeExtraneousValues: true,
    });

    return { txs: txsOuput, count };
  }

  async getTxByHash(ctx: RequestContext, hash): Promise<any> {
    this.logger.log(ctx, `${this.getTxByHash.name} was called!`);

    return await this.txRepository.findOne({
      where: { tx_hash: hash },
    });
  }
}
