import { HttpService } from '@nestjs/axios';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { plainToClass } from 'class-transformer';

import { AkcLogger, RequestContext, Transaction } from '../../../shared';

import { TxParamsDto } from '../dtos/transaction-params.dto';
import { LiteTransactionOutput } from '../dtos/transaction-output.dto';
import { TransactionRepository } from '../repositories/transaction.repository';
import { Raw } from 'typeorm/find-options/operator/Raw';
import { DelegationParamsDto } from '../../../components/validator/dtos/delegation-params.dto';

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
    query: DelegationParamsDto,
  ): Promise<{ transactions: LiteTransactionOutput[]; count: number }> {
    this.logger.log(ctx, `${this.getTransactionByAddress.name} was called!`);

    const [transactions, count]  = await this.txRepository.findAndCount({
      where: (
        { raw_log: Raw(() => `code = 0 AND
          (JSON_CONTAINS(JSON_EXTRACT( (CASE WHEN LENGTH(raw_log) = 0 THEN "[]" else raw_log END), "$[*].events[*].type"), '"delegate"', '$') = 1
          OR JSON_CONTAINS(JSON_EXTRACT( (CASE WHEN LENGTH(raw_log) = 0 THEN "[]" else raw_log END), "$[*].events[*].type"), '"unbond"', '$') = 1)
          AND JSON_CONTAINS(JSON_EXTRACT( (CASE WHEN LENGTH(raw_log) = 0 THEN "[]" else raw_log END), "$[*].events[*].attributes[*].key"), '"validator"', '$') = 1
          AND JSON_CONTAINS(JSON_EXTRACT( (CASE WHEN LENGTH(raw_log) = 0 THEN "[]" else raw_log END), "$[*].events[*].attributes[*].value"), '"${validatorAddress}"', '$') = 1
          `)}
      ),
      order: { height: 'DESC' },
      take: query.limit,
      skip: query.offset,
    });

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
              data.fee = '+ ' + (parseInt(amount) / 1000000).toFixed(6);
            } else {
              data.fee = '- ' + (parseInt(amount) / 1000000).toFixed(6);
            }
            data.type = txAttr.type;
          }
        }
      }

    });

    const transactionsOutput = plainToClass(LiteTransactionOutput, transactions, {
      excludeExtraneousValues: true,
    });

    return { transactions: transactionsOutput, count };
  }
  
  async getTransactionByDelegatorAddress(
    ctx: RequestContext,
    address,
    query: DelegationParamsDto,
  ): Promise<{ transactions: LiteTransactionOutput[]; count: number }> {
    this.logger.log(ctx, `${this.getTransactionByDelegatorAddress.name} was called!`);

    const [transactions, count]  = await this.txRepository.findAndCount({
      where: (
        { messages: Raw(() => `JSON_SEARCH(messages, 'all', '${address}')`)}
      ),
      order: { height: 'DESC' },
      take: query.limit,
      skip: query.offset,
    });

    const transactionsOutput = plainToClass(LiteTransactionOutput, transactions, {
      excludeExtraneousValues: true,
    });

    return { transactions: transactionsOutput, count };
  }
}
