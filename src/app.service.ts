import { HttpService } from '@nestjs/axios';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { lastValueFrom } from 'rxjs';

import { AkcLogger, RequestContext } from './shared';
import { StatusOutput } from './components/dashboard/dtos/status-output.dto';
import { TransactionService } from './components/transaction/services/transaction.service';

@Injectable()
export class AppService {
  constructor(
    private logger: AkcLogger,
    private configService: ConfigService,
    private httpService: HttpService,
    private txService: TransactionService,
  ) {
    this.logger.setContext(AppService.name);
  }
  getHello(): string {
    const ctx = new RequestContext();
    this.logger.log(ctx, 'Hello World!');
    return 'Hello World!';
  }

  async getStatus(ctx: RequestContext): Promise<StatusOutput> {
    this.logger.log(ctx, `${this.getStatus.name} was called!`);

    this.logger.log(ctx, `calling get latest txs from node`);
    const rpc = this.configService.get<string>('node.rpc');

    // get latest block height
    let lastHeight;
    const payloadGetBlockHeight = {
      jsonrpc: '2.0',
      id: 1,
      method: 'blockchain',
      params: ['0', '0'],
    };
    const dataBlockHeight = await lastValueFrom(
      this.httpService.post(rpc, payloadGetBlockHeight),
    ).then((rs) => rs.data);
    if (typeof dataBlockHeight.error != 'undefined') {
      throw new InternalServerErrorException();
    }
    if (typeof dataBlockHeight.result != 'undefined') {
      lastHeight = dataBlockHeight.result.last_height;
    }

    // get total tx
    const totalTxsNum = await this.txService.getTotalTx();

    // get tx
    let totalValidator;
    const payloadGetValidator = {
      jsonrpc: '2.0',
      id: 1,
      method: 'validators',
      params: [`${lastHeight}`, '1', '100'],
    };
    const dataValidator = await lastValueFrom(
      this.httpService.post(rpc, payloadGetValidator),
    ).then((rs) => rs.data);
    if (typeof dataValidator.error != 'undefined') {
      throw new InternalServerErrorException();
    }
    if (typeof dataValidator.result != 'undefined') {
      totalValidator = dataValidator.result.total;
    }

    return {
      block_height: lastHeight,
      total_txs_num: totalTxsNum,
      total_validator_num: totalValidator,
    };
  }
}
