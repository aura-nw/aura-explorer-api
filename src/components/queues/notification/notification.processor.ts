import { InjectQueue, Process, Processor } from '@nestjs/bull';
import { INDEXER_API_V2, QUEUES, SYNC_POINT_TYPE } from '../../../shared';
import { Logger } from '@nestjs/common';
import { ServiceUtil } from '../../../shared/utils/service.util';
import { ConfigService } from '@nestjs/config';
import { Queue } from 'bull';
import { CronExpression } from '@nestjs/schedule';
import { SyncPointRepository } from '../../sync-point/repositories/sync-point.repository';
import { lastValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';

@Processor(QUEUES.NOTIFICATION.QUEUE_NAME)
export class NotificationProcessor {
  private readonly logger = new Logger(NotificationProcessor.name);
  private indexerChainId;
  private indexerApi;
  private chainDB;

  constructor(
    private serviceUtil: ServiceUtil,
    private configService: ConfigService,
    private httpService: HttpService,
    private syncPointRepos: SyncPointRepository,
    @InjectQueue(QUEUES.NOTIFICATION.QUEUE_NAME) private readonly queue: Queue,
  ) {
    this.logger.log(
      '============== Constructor CW4973Processor Service ==============',
    );
    this.indexerChainId = this.configService.get('indexer.chainId');
    this.indexerApi = this.configService.get('indexerV2.graphQL');

    this.queue.add(
      QUEUES.NOTIFICATION.JOBS.SYNC_NOTIFICATION,
      {},
      {
        repeat: { cron: CronExpression.EVERY_10_SECONDS },
      },
    );

    this.chainDB = configService.get('indexerV2.chainDB');
  }

  @Process(QUEUES.NOTIFICATION.JOBS.SYNC_NOTIFICATION)
  async handleJobSyncNotification() {
    const currentTxHeight = await this.syncPointRepos.findOne({
      where: {
        type: SYNC_POINT_TYPE.TX_BLOCK_HEIGHT,
      },
    });

    if (!currentTxHeight) {
      const params = `?chainid=${this.indexerChainId}`;
      const data = await lastValueFrom(
        this.httpService.get(this.indexerApi + params),
      ).then((rs) => rs.data);
      await this.syncPointRepos.save({
        type: SYNC_POINT_TYPE.TX_BLOCK_HEIGHT,
        point: data?.total_blocks || 0,
      });
      return;
    }

    const graphQlQuery = {
      query: INDEXER_API_V2.GRAPH_QL.TX_DETAIL_NOTIFICATION,
      variables: {
        heightGT: currentTxHeight.point,
        listFilterCW20: [
          'mint',
          'burn',
          'transfer',
          'send',
          'transfer_from',
          'burn_from',
          'send_from',
        ],
        listFilterCW721: ['mint', 'burn', 'transfer_nft', 'send_nft'],
        compositeKeyIn: ['transfer.sender', 'transfer.recipient'],
      },
      operationName: INDEXER_API_V2.OPERATION_NAME.TX_DETAIL_NOTIFICATION,
    };

    const response = (await this.serviceUtil.fetchDataFromGraphQL(graphQlQuery))
      ?.data[this.chainDB];

    if (response?.executed?.length > 0) {
    }
    if (response?.coin_transfer?.length > 0) {
    }
    if (response?.token_transfer?.length > 0) {
    }
    if (response?.nft_transfer?.length > 0) {
    }
  }
}
