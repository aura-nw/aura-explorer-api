import { HttpService } from '@nestjs/axios';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import {
  AkcLogger,
  CONST_CHAR,
  CONST_NUM,
  LINK_API,
  RequestContext,
} from './shared';
import { StatusOutput } from './components/dashboard/dtos/status-output.dto';
import { TransactionService } from './components/transaction/services/transaction.service';
import { BlockService } from './components/block/services/block.service';
import { ValidatorService } from './components/validator/services/validator.service';
import { ServiceUtil } from './shared/utils/service.util';

@Injectable()
export class AppService {
  cosmosScanAPI: string;
  private indexerUrl;
  private indexerChainId;

  constructor(
    private logger: AkcLogger,
    private configService: ConfigService,
    private httpService: HttpService,
    private txService: TransactionService,
    private blockService: BlockService,
    private validatorService: ValidatorService,
    private serviceUtil: ServiceUtil
  ) {
    this.logger.setContext(AppService.name);
    this.cosmosScanAPI = this.configService.get<string>('cosmosScanAPI');
    this.indexerUrl = this.configService.get('INDEXER_URL');
    this.indexerChainId = this.configService.get('INDEXER_CHAIN_ID');
  }
  getHello(): string {
    const ctx = new RequestContext();
    this.logger.log(ctx, 'Hello World!');
    return 'Hello World!';
  }

  async getStatus(ctx: RequestContext): Promise<StatusOutput> {
    this.logger.log(ctx, `${this.getStatus.name} was called!`);
    this.logger.log(ctx, `calling get latest txs from node`);

    const [
      statusData,
      { blocks },
      totalValidatorNum,
      totalValidatorActiveNum,
      totalTxsNum,
    ] = await Promise.all([
      this.serviceUtil.getDataAPI(`${this.indexerUrl}api/v1/network/status?chainid=${this.indexerChainId}`, '', ctx),
      this.blockService.getDataBlocks(ctx, CONST_NUM.LIMIT_2, CONST_NUM.OFFSET),
      this.validatorService.getTotalValidator(),
      this.validatorService.getTotalValidatorActive(),
      this.txService.getTotalTx(),
    ]);

    let blockTime;
    let height;
    let comPool;
    if (blocks.length === 2) {
      const block_first = blocks[0].timestamp.getTime();
      const block_second = blocks[1].timestamp.getTime();
      blockTime =
        Math.floor(Math.abs(block_first - block_second) / 1000) +
        CONST_CHAR.SECOND;
      height = blocks[0].height;
    }
    const data = statusData.data;
    const bonded_tokens = parseInt(data.pool.bonded_tokens);
    const inflation = (data.inflation.inflation * 100).toFixed(2) + CONST_CHAR.PERCENT;
    if (data?.communityPool && data.communityPool?.pool && data.communityPool.pool.length > 0) {
      comPool = parseInt(data.communityPool.pool[0].amount);
    }

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
