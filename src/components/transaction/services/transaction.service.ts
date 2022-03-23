import { HttpService } from '@nestjs/axios';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { plainToClass } from 'class-transformer';
import { lastValueFrom } from 'rxjs';

import { AkcLogger, CONST_CHAR, RequestContext, Transaction } from '../../../shared';

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

  async getTransactionByAddress(
    ctx: RequestContext,
    validatorAddress,
    query: TxParamsDto,
  ): Promise<{ transactions: LiteTransactionOutput[]; count: number }> {
    this.logger.log(ctx, `${this.getTransactionByAddress.name} was called!`);
    query.limit = 5;

    const [transactions, count]  = await this.txRepository.findAndCount({
      // where: (
      //   'raw_log @> :raw_log', {
      //     raw_log: {
      //       type: 'delegate',
      //     }
      //   }
      // ),
      // where: { '(
      //   'JSON_CONTAINS(json_extract(raw_log, "$[0].events[*].type"), json_array("delegate"))
      //  OR JSON_CONTAINS(json_extract(raw_log, "$[0].events[*].type"), json_array("unbond"))
      //  ) '
      // },
      order: { height: 'DESC' },
      take: query.limit,
      skip: query.offset,
    });
    this.txRepository

    let transactionsData = [];
    transactions.forEach(data => {
      let validatorAddr;
      if (data.code === 0) {
        const rawLog = JSON.parse(data.raw_log);

        const txAttr = rawLog[0].events.find(
          ({ type }) => type === 'delegate' || type === 'unbond',
        );
        if (txAttr) {
          const txAction = txAttr.attributes.find(
            ({ key }) => key === 'validator',
          );
          const regex = /_/gi;
          validatorAddr = txAction.value.replace(regex, ' ');
          if (validatorAddr === validatorAddress) {
            const txActionAmount = txAttr.attributes.find(
              ({ key }) => key === 'amount',
            );
            const amount = txActionAmount.value.replace(regex, ' ');
            amount.replace('uaura', '');
            if (txAttr.type === 'delegate') {
              data.fee = '+' + (parseInt(amount) / 1000000).toFixed(6);
            } else {
              data.fee = '-' + (parseInt(amount) / 1000000).toFixed(6);
            }
            data.type = txAttr.type;
            transactionsData.push(data);
          }
        }
      }

    });

    const transactionsOutput = plainToClass(LiteTransactionOutput, transactionsData, {
      excludeExtraneousValues: true,
    });


    return { transactions: transactionsOutput, count };
  }
}
