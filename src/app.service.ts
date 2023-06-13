import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';

import * as util from 'util';
import { SyncStatusRepository } from './components/block/repositories/syns-status.repository';
import { StatusOutput } from './components/dashboard/dtos/status-output.dto';
import { MetricService } from './components/metric/services/metric.service';
import { ValidatorService } from './components/validator/services/validator.service';
import { AkcLogger, CONST_CHAR, INDEXER_API, RequestContext } from './shared';
import * as appConfig from './shared/configs/configuration';
import { ServiceUtil } from './shared/utils/service.util';

@Injectable()
export class AppService {
  cosmosScanAPI: string;
  private indexerUrl;
  private indexerChainId;
  private appParams;
  private minimalDenom;

  constructor(
    private readonly logger: AkcLogger,
    private validatorService: ValidatorService,
    private serviceUtil: ServiceUtil,
    private syncStatusRepos: SyncStatusRepository,
    private metricService: MetricService,
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
      this.serviceUtil.getDataAPI(
        `${this.indexerUrl}${util.format(
          INDEXER_API.STATUS,
          this.indexerChainId,
        )}`,
        '',
        ctx,
      ),
      this.syncStatusRepos.findOne(),
      this.validatorService.getTotalValidator(),
      this.validatorService.getTotalValidatorActive(),
      this.metricService.getNumberTransactions(),
    ]);

    let height;
    let comPool;
    let supply;
    if (blocks) {
      height = blocks.current_block;
    }

    const data = statusData.data;
    const bonded_tokens = Number(data.pool.bonded_tokens);
    const inflation =
      (data.inflation.inflation * 100).toFixed(2) + CONST_CHAR.PERCENT;
    const communityPool = data?.communityPool;
    const supplyData = data?.supply?.supply;

    if (communityPool && communityPool?.pool && communityPool.pool.length > 0) {
      const filterCommunityPool = communityPool.pool.filter(
        (f) => String(f.denom) === this.appParams.chainInfo.coinMinimalDenom,
      );
      if (filterCommunityPool) {
        comPool = Number(filterCommunityPool[0].amount);
      }
    }
    if (data?.supply && data.supply?.supply && data.supply.supply.length > 0) {
      const supplyDenom = data.supply.supply.find(
        (f) => f.denom === this.minimalDenom,
      );
      if (supplyDenom) {
        supply = parseInt(supplyDenom.amount);
      }
    }

    return {
      block_height: height,
      total_txs_num: totalTxsNum ? Number(totalTxsNum[0].total) : 0,
      total_validator_num: totalValidatorNum,
      total_validator_active_num: totalValidatorActiveNum,
      block_time: '',
      bonded_tokens: bonded_tokens,
      inflation: inflation,
      community_pool: comPool,
      supply: supply,
    };
  }
}
