import { HttpService } from '@nestjs/axios';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import {
  AkcLogger,
  CONST_CHAR,
  CONST_NUM,
  INDEXER_API,
  LINK_API,
  RequestContext,
} from './shared';
import { StatusOutput } from './components/dashboard/dtos/status-output.dto';
import { TransactionService } from './components/transaction/services/transaction.service';
import { BlockService } from './components/block/services/block.service';
import { ValidatorService } from './components/validator/services/validator.service';
import { ServiceUtil } from './shared/utils/service.util';
import * as appConfig from './shared/configs/configuration';
import * as util from 'util';
import { SyncStatusRepository } from './components/schedule/repositories/syns-status.repository';

@Injectable()
export class AppService {
  cosmosScanAPI: string;
  private indexerUrl;
  private indexerChainId;
  private appParams;
  private minimalDenom;

  constructor(
    private readonly logger: AkcLogger,
    private configService: ConfigService,
    private httpService: HttpService,
    private txService: TransactionService,
    private blockService: BlockService,
    private validatorService: ValidatorService,
    private serviceUtil: ServiceUtil,
    private syncStatusRepos : SyncStatusRepository
  ) {
    this.logger.setContext(AppService.name);
    this.appParams = appConfig.default();
    this.cosmosScanAPI = this.appParams.cosmosScanAPI;
    this.indexerUrl = this.appParams.indexer.url;
    this.indexerChainId = this.appParams.indexer.chainId;
    this.minimalDenom = this.appParams.chainInfo.coinMinimalDenom;
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
      blocks,
      totalValidatorNum,
      totalValidatorActiveNum,
      totalTxsNum,
    ] = await Promise.all([
      this.serviceUtil.getDataAPI(`${this.indexerUrl}${util.format(INDEXER_API.STATUS, this.indexerChainId)}`, '', ctx),
      this.syncStatusRepos.findOne(),
      // this.blockService.getDataBlocks(ctx, CONST_NUM.LIMIT_2, CONST_NUM.OFFSET),
      this.validatorService.getTotalValidator(),
      this.validatorService.getTotalValidatorActive(),
      this.txService.getTotalTx(),
    ]);

    let blockTime;
    let height;
    let comPool;
    let supply;
    if (blocks) {
      // const block_first = blocks[0].timestamp.getTime();
      // const block_second = blocks[1].timestamp.getTime();
      // blockTime =
      //   Math.floor(Math.abs(block_first - block_second) / 1000) +
      //   CONST_CHAR.SECOND;
      height = blocks.current_block;
    }

    const data = statusData.data;
    const bonded_tokens = Number(data.pool.bonded_tokens);
    const inflation = (data.inflation.inflation * 100).toFixed(2) + CONST_CHAR.PERCENT;
    const communityPool = data?.communityPool;
    const supplyData = data?.supply?.supply;

    if (communityPool && communityPool?.pool && communityPool.pool.length > 0) {
      const filterCommunityPool = communityPool.pool.filter( f => String(f.denom) === this.appParams.chainInfo.coinMinimalDenom);
      if(filterCommunityPool){
        comPool = Number(filterCommunityPool[0].amount);
      }
    }
    if (data?.supply && data.supply?.supply && data.supply.supply.length > 0) {
      const supplyDenom = data.supply.supply.find(f => f.denom === this.minimalDenom);
      if (supplyDenom) {
        supply = parseInt(supplyDenom.amount);
      }
    }

    return {
      block_height: height,
      total_txs_num: totalTxsNum,
      total_validator_num: totalValidatorNum,
      total_validator_active_num: totalValidatorActiveNum,
      block_time: '',
      bonded_tokens: bonded_tokens,
      inflation: inflation,
      community_pool: comPool,
      supply: supply
    };
  }
}
