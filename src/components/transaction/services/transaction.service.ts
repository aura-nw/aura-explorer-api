import { HttpService } from '@nestjs/axios';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { plainToClass } from 'class-transformer';
import { lastValueFrom } from 'rxjs';

import { AkcLogger, RequestContext, Transaction } from '../../../shared';

import { TxParamsDto } from '../dtos/transaction-params.dto';
import { LiteTransactionOutput } from '../dtos/transaction-output.dto';
import { TransactionRepository } from '../repositories/transaction.repository';
import { Raw } from 'typeorm/find-options/operator/Raw';
import { DelegationParamsDto } from 'src/components/validator/dtos/delegation-params.dto';

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
    query.limit = 5;

    const [transactions, count]  = await this.txRepository.findAndCount({
      where: (
        { raw_log: Raw(() => `(JSON_CONTAINS(JSON_EXTRACT( (Case when Length(raw_log) = 0 then "[]"else raw_log end), "$[*].events[*].type"), '"delegate"', '$') = 1
          OR JSON_CONTAINS(JSON_EXTRACT( (Case when Length(raw_log) = 0 then "[]"else raw_log end), "$[*].events[*].type"), '"unbond"', '$') = 1)
          AND JSON_CONTAINS(JSON_EXTRACT( (Case when Length(raw_log) = 0 then "[]"else raw_log end), "$[*].events[*].attributes[*].key"), '"validator"', '$') = 1
          AND JSON_CONTAINS(JSON_EXTRACT( (Case when Length(raw_log) = 0 then "[]"else raw_log end), "$[*].events[*].attributes[*].value"), '"${validatorAddress}"', '$') = 1
          `)}
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
