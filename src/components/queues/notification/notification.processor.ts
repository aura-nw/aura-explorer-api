import { InjectQueue, Process, Processor } from '@nestjs/bull';
import { QUEUES } from '../../../shared';
import { Logger } from '@nestjs/common';
import { ServiceUtil } from '../../../shared/utils/service.util';
import { ConfigService } from '@nestjs/config';
import { Queue } from 'bull';
import { CronExpression } from '@nestjs/schedule';

@Processor(QUEUES.NOTIFICATION.QUEUE_NAME)
export class NotificationProcessor {
  private readonly logger = new Logger(NotificationProcessor.name);
  private indexerChainId;
  private chainDB;

  constructor(
    private serviceUtil: ServiceUtil,
    private configService: ConfigService,
    @InjectQueue(QUEUES.NOTIFICATION.QUEUE_NAME) private readonly queue: Queue,
  ) {
    this.logger.log(
      '============== Constructor CW4973Processor Service ==============',
    );
    this.indexerChainId = this.configService.get('indexer.chainId');

    this.queue.add(
      QUEUES.NOTIFICATION.JOBS.SYNC_NOTIFICATION,
      {},
      {
        repeat: { cron: CronExpression.EVERY_10_SECONDS },
      },
    );

    this.chainDB = configService.get('indexerV2.chainDB');
  }

  @Process(QUEUES.CW4973.JOBS.SYNC_4973_STATUS)
  async handleJobSyncCw4973Status() {

  }


}
