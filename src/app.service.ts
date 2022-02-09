import { HttpService } from '@nestjs/axios';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { lastValueFrom } from 'rxjs';

import { AkcLogger, RequestContext } from './shared';
import { StatusOutput } from './components/dashboard/dtos/status-output.dto';
import { TransactionService } from './components/transaction/services/transaction.service';

@Injectable()
export class AppService {
  cosmosScanAPI: string;

  constructor(
    private logger: AkcLogger,
    private configService: ConfigService,
    private httpService: HttpService,
    private txService: TransactionService,
  ) {
    this.logger.setContext(AppService.name);
    this.cosmosScanAPI = this.configService.get<string>('cosmosScanAPI');
  }
  getHello(): string {
    const ctx = new RequestContext();
    this.logger.log(ctx, 'Hello World!');
    return 'Hello World!';
  }

  async getDataAPI(api, params, ctx) {
    this.logger.log(
      ctx,
      `${this.getDataAPI.name} was called, to ${api + params}!`,
    );
    const data = await lastValueFrom(this.httpService.get(api + params)).then(
      (rs) => rs.data,
    );

    return data;
  }

  async getStatus(ctx: RequestContext): Promise<StatusOutput> {
    this.logger.log(ctx, `${this.getStatus.name} was called!`);

    this.logger.log(ctx, `calling get latest txs from node`);
    const rpc = this.configService.get<string>('node.rpc');

    // get latest metadata
    const meta = await this.getDataAPI(this.cosmosScanAPI, '/meta', ctx);

    // let lastHeight;
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

    // get total tx
    const totalTxsNum = await this.txService.getTotalTx();

    // get tx
    let totalValidator;
    const payloadGetValidator = {
      jsonrpc: '2.0',
      id: 1,
      method: 'validators',
      params: [`${meta.height}`, '1', '100'],
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
      block_height: meta.height,
      total_txs_num: totalTxsNum,
      total_validator_num: totalValidator,
      latest_validator: meta.latest_validator,
      validator_avg_fee: meta.validator_avg_fee,
      block_time: meta.block_time,
    };
  }
}
