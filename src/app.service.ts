import { HttpService } from '@nestjs/axios';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { lastValueFrom } from 'rxjs';

import { AkcLogger, CONST_CHAR, CONST_NUM, LINK_API, RequestContext } from './shared';
import { StatusOutput } from './components/dashboard/dtos/status-output.dto';
import { TransactionService } from './components/transaction/services/transaction.service';
import { BlockService } from './components/block/services/block.service';
import { ValidatorService } from './components/validator/services/validator.service';

@Injectable()
export class AppService {
  cosmosScanAPI: string;

  constructor(
    private logger: AkcLogger,
    private configService: ConfigService,
    private httpService: HttpService,
    private txService: TransactionService,
    private blockService: BlockService,
    private validatorService: ValidatorService,
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
    const api = this.configService.get<string>('node.api');

    // get staking pool
    const paramPool = LINK_API.STAKING_POOL;
    const poolData = await this.getDataAPI(api, paramPool, ctx);

    // get inflation
    const paramInflation = LINK_API.INFLATION;
    const inflationData = await this.getDataAPI(api, paramInflation, ctx);

    // get community pool
    const paramComPool = LINK_API.COMMUNITY_POOL;
    const comPoolData = await this.getDataAPI(api, paramComPool, ctx);

    // get blocks by limit 2
    const { blocks } = await this.blockService.getDataBlocks(ctx, CONST_NUM.LIMIT_2, CONST_NUM.OFFSET);
    
    let blockTime;
    let height;
    let comPool;
    if (blocks.length === 2) {
      const block_first = blocks[0].timestamp.getTime();
      const block_second = blocks[1].timestamp.getTime();
      blockTime = Math.floor(Math.abs(block_first - block_second) / 1000) + CONST_CHAR.SECOND;
      height = blocks[0].id;
    }
    
    const bonded_tokens = parseInt(poolData.pool.bonded_tokens);
    const inflation = (inflationData.inflation * 100).toFixed(2) + CONST_CHAR.PERCENT;
    if (comPoolData) {
      comPool = parseInt(comPoolData.pool[0].amount);
    }
    // get total validator
    const totalValidatorNum = await this.validatorService.getTotalValidator();
    // get total validator active
    const totalValidatorActiveNum = await this.validatorService.getTotalValidatorActive();
    // get total tx
    const totalTxsNum = await this.txService.getTotalTx();

    return {
      block_height: height,
      total_txs_num: totalTxsNum,
      total_validator_num: totalValidatorNum,
      total_validator_active_num: totalValidatorActiveNum,
      block_time: blockTime,
      bonded_tokens: bonded_tokens,
      inflation: inflation,
      community_pool: comPool,
    };
  }
}
