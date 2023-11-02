import {
  InjectQueue,
  OnQueueActive,
  OnQueueCompleted,
  OnQueueError,
  OnQueueFailed,
  Process,
  Processor,
} from '@nestjs/bull';
import {
  INDEXER_API_V2,
  NOTIFICATION,
  QUEUES,
  SYNC_POINT_TYPE,
  USER_ACTIVITIES,
} from '../../../shared';
import { Logger } from '@nestjs/common';
import { ServiceUtil } from '../../../shared/utils/service.util';
import { ConfigService } from '@nestjs/config';
import { Job, Queue } from 'bull';
import { CronExpression } from '@nestjs/schedule';
import { SyncPointRepository } from '../../sync-point/repositories/sync-point.repository';
import { lastValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import * as firebaseAdmin from 'firebase-admin';
import { PrivateNameTagRepository } from '../../private-name-tag/repositories/private-name-tag.repository';
import { PublicNameTagRepository } from '../../public-name-tag/repositories/public-name-tag.repository';
import { NotificationTokenRepository } from './repositories/notification-token.repository';
import { NotificationUtil } from './utils/notification.util';
import { NotificationDto } from './dtos/notification.dtos';
import { UserActivity } from '../../../shared/entities/user-activity.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { NotificationRepository } from './repositories/notification.repository';
import { WatchList } from 'src/shared/entities/watch-list.entity';
import { SyncPoint } from 'src/shared/entities/sync-point.entity';

@Processor(QUEUES.NOTIFICATION.QUEUE_NAME)
export class NotificationProcessor {
  private readonly logger = new Logger(NotificationProcessor.name);
  private indexerChainId;
  private chainDB;

  constructor(
    private serviceUtil: ServiceUtil,
    private configService: ConfigService,
    private httpService: HttpService,
    private syncPointRepos: SyncPointRepository,
    private notificationUtil: NotificationUtil,
    private privateNameTagRepository: PrivateNameTagRepository,
    private publicNameTagRepository: PublicNameTagRepository,
    private notificationTokenRepository: NotificationTokenRepository,
    private notificationReposiotry: NotificationRepository,
    @InjectRepository(UserActivity)
    private userActivityRepository: Repository<UserActivity>,
    @InjectRepository(WatchList)
    private watchListRepository: Repository<WatchList>,
    @InjectQueue(QUEUES.NOTIFICATION.QUEUE_NAME) private readonly queue: Queue,
  ) {
    this.logger.log(
      '============== Constructor CW4973Processor Service ==============',
    );
    firebaseAdmin.initializeApp({
      credential: firebaseAdmin.credential.cert({
        projectId: process.env.FCM_PROJECT_ID,
        privateKey: Buffer.from(process.env.FCM_PRIVATE_KEY, 'base64').toString(
          'ascii',
        ),
        clientEmail: process.env.FCM_CLIENT_EMAIL,
      }),
    });

    this.indexerChainId = this.configService.get('indexer.chainId');

    this.queue.add(
      QUEUES.NOTIFICATION.JOBS.NOTIFICATION_EXECUTED,
      {},
      {
        repeat: { cron: CronExpression.EVERY_10_SECONDS },
      },
    );

    this.queue.add(
      QUEUES.NOTIFICATION.JOBS.NOTIFICATION_COIN_TRANSFER,
      {},
      {
        repeat: { cron: CronExpression.EVERY_10_SECONDS },
      },
    );

    this.queue.add(
      QUEUES.NOTIFICATION.JOBS.NOTIFICATION_NFT_TRANSFER,
      {},
      {
        repeat: { cron: CronExpression.EVERY_10_SECONDS },
      },
    );

    this.queue.add(
      QUEUES.NOTIFICATION.JOBS.NOTIFICATION_TOKEN_TRANSFER,
      {},
      {
        repeat: { cron: CronExpression.EVERY_10_SECONDS },
      },
    );

    this.queue.add(
      QUEUES.NOTIFICATION.JOBS.RESET_NOTIFICATION,
      {},
      {
        repeat: { cron: CronExpression.EVERY_DAY_AT_MIDNIGHT },
      },
    );

    this.chainDB = configService.get('indexerV2.chainDB');
  }

  @Process(QUEUES.NOTIFICATION.JOBS.NOTIFICATION_EXECUTED)
  async notificationExecuted() {
    try {
      const currentTxHeight = await this.syncPointRepos.findOne({
        where: {
          type: SYNC_POINT_TYPE.EXECUTED_HEIGHT,
        },
      });

      if (!currentTxHeight) {
        await this.updateBlockNotification(SYNC_POINT_TYPE.EXECUTED_HEIGHT);
        return;
      }

      const watchList = await this.watchListRepository.find({
        where: { tracking: true },
        relations: ['user'],
      });
      if (watchList?.length > 0) {
        const graphQlQuery = {
          query: INDEXER_API_V2.GRAPH_QL.EXECUTED_NOTIFICATION,
          variables: {
            heightGT: currentTxHeight.point,
          },
          operationName: INDEXER_API_V2.OPERATION_NAME.EXECUTED_NOTIFICATION,
        };

        const response = (
          await this.serviceUtil.fetchDataFromGraphQL(graphQlQuery)
        )?.data[this.chainDB];
        if (response?.executed?.length > 0) {
          // Pre-Process
          const { notificationTokens, privateNameTags, publicNameTags } =
            await this.preProcessNotification();

          // Get executed notification
          const notifications =
            await this.notificationUtil.processExecutedNotification(
              response,
              watchList?.filter(
                (item) =>
                  !!item.settings && item.settings['transactionExecuted'],
              ),
              notificationTokens,
              privateNameTags,
              publicNameTags,
            );

          // Process notification and push to firebase
          await this.processNotification(
            notifications,
            currentTxHeight,
            response?.executed[0],
          );
        }
      }
    } catch (err) {
      this.logger.error(`notificationExecuted has error: ${err.stack}`);
    }
  }

  @Process(QUEUES.NOTIFICATION.JOBS.NOTIFICATION_COIN_TRANSFER)
  async notificationCoinTransfer() {
    try {
      const currentTxHeight = await this.syncPointRepos.findOne({
        where: {
          type: SYNC_POINT_TYPE.COIN_TRANSFER_HEIGHT,
        },
      });

      if (!currentTxHeight) {
        await this.updateBlockNotification(
          SYNC_POINT_TYPE.COIN_TRANSFER_HEIGHT,
        );
        return;
      }

      const watchList = await this.watchListRepository.find({
        where: { tracking: true },
        relations: ['user'],
      });
      if (watchList?.length > 0) {
        const graphQlQuery = {
          query: INDEXER_API_V2.GRAPH_QL.COIN_TRANSFER_NOTIFICATION,
          variables: {
            heightGT: currentTxHeight.point,
            compositeKeyIn: ['transfer.sender', 'transfer.recipient'],
          },
          operationName:
            INDEXER_API_V2.OPERATION_NAME.COIN_TRANSFER_NOTIFICATION,
        };

        const response = (
          await this.serviceUtil.fetchDataFromGraphQL(graphQlQuery)
        )?.data[this.chainDB];

        if (response?.coin_transfer?.length > 0) {
          // Convert data coin transfer
          const listTx = await this.notificationUtil.convertDataCoinTransfer(
            response?.coin_transfer,
          );
          // Pre-Process
          const {
            notificationTokens,
            privateNameTags,
            publicNameTags,
            notifyReceived,
            notifySent,
          } = await this.preProcessNotification(listTx);

          // Get received native coin notification
          const coinTransferReceived =
            await this.notificationUtil.processCoinTransferNotification(
              notifyReceived,
              watchList?.filter(
                (item) =>
                  !!item.settings && item.settings['nativeCoinReceived'].turnOn,
              ),
              notificationTokens,
              privateNameTags,
              publicNameTags,
            );

          // Get sent native coin notification
          const coinTransferSent =
            await this.notificationUtil.processCoinTransferNotification(
              notifySent,
              watchList?.filter(
                (item) =>
                  !!item.settings && item.settings['nativeCoinSent'].turnOn,
              ),
              notificationTokens,
              privateNameTags,
              publicNameTags,
            );

          // Process notification and push to firebase
          await this.processNotification(
            [...coinTransferSent, ...coinTransferReceived],
            currentTxHeight,
            response?.coin_transfer[0],
          );
        } else {
          // Update sync point coin transfer height
          this.updateBlockNotification(
            SYNC_POINT_TYPE.COIN_TRANSFER_HEIGHT,
            currentTxHeight,
          );
        }
      }
    } catch (err) {
      this.logger.error(`notificationCoinTransfer has error: ${err.stack}`);
    }
  }

  @Process(QUEUES.NOTIFICATION.JOBS.NOTIFICATION_TOKEN_TRANSFER)
  async notificationTokenTransfer() {
    try {
      const currentTxHeight = await this.syncPointRepos.findOne({
        where: {
          type: SYNC_POINT_TYPE.TOKEN_TRANSFER_HEIGHT,
        },
      });

      if (!currentTxHeight) {
        await this.updateBlockNotification(
          SYNC_POINT_TYPE.TOKEN_TRANSFER_HEIGHT,
        );
        return;
      }

      const watchList = await this.watchListRepository.find({
        where: { tracking: true },
        relations: ['user'],
      });

      if (watchList?.length > 0) {
        const graphQlQuery = {
          query: INDEXER_API_V2.GRAPH_QL.TOKEN_TRANSFER_NOTIFICATION,
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
          },
          operationName:
            INDEXER_API_V2.OPERATION_NAME.TOKEN_TRANSFER_NOTIFICATION,
        };

        const response = (
          await this.serviceUtil.fetchDataFromGraphQL(graphQlQuery)
        )?.data[this.chainDB];

        if (response?.token_transfer?.length > 0) {
          // Pre-Process
          const {
            notificationTokens,
            privateNameTags,
            publicNameTags,
            notifyReceived,
            notifySent,
          } = await this.preProcessNotification(response?.token_transfer);

          // Get received token notification
          const nftTransferSent =
            await this.notificationUtil.processTokenTransferNotification(
              notifySent,
              watchList?.filter(
                (item) => !!item.settings && item.settings['tokenSent'].turned,
              ),
              notificationTokens,
              privateNameTags,
              publicNameTags,
            );

          // Get sent token notification
          const nftTransferReceived =
            await this.notificationUtil.processTokenTransferNotification(
              notifyReceived,
              watchList?.filter(
                (item) =>
                  !!item.settings && item.settings['tokenReceived'].turned,
              ),
              notificationTokens,
              privateNameTags,
              publicNameTags,
            );

          // Process notification and push to firebase
          await this.processNotification(
            [...nftTransferReceived, ...nftTransferSent],
            currentTxHeight,
            response?.token_transfer[0],
          );
        }
      }
    } catch (err) {
      this.logger.error(`notificationTokenTransfer has error: ${err.stack}`);
    }
  }

  @Process(QUEUES.NOTIFICATION.JOBS.NOTIFICATION_NFT_TRANSFER)
  async notificationNftTransfer() {
    try {
      const currentTxHeight = await this.syncPointRepos.findOne({
        where: {
          type: SYNC_POINT_TYPE.NFT_TRANSFER_HEIGHT,
        },
      });

      if (!currentTxHeight) {
        await this.updateBlockNotification(SYNC_POINT_TYPE.NFT_TRANSFER_HEIGHT);
        return;
      }

      const watchList = await this.watchListRepository.find({
        where: { tracking: true },
        relations: ['user'],
      });
      if (watchList?.length > 0) {
        const graphQlQuery = {
          query: INDEXER_API_V2.GRAPH_QL.NFT_TRANSFER_NOTIFICATION,
          variables: {
            heightGT: currentTxHeight.point,
            listFilterCW721: ['mint', 'burn', 'transfer_nft', 'send_nft'],
          },
          operationName:
            INDEXER_API_V2.OPERATION_NAME.NFT_TRANSFER_NOTIFICATION,
        };

        const response = (
          await this.serviceUtil.fetchDataFromGraphQL(graphQlQuery)
        )?.data[this.chainDB];

        if (response?.nft_transfer?.length > 0) {
          // Pre-Process
          const {
            notificationTokens,
            privateNameTags,
            publicNameTags,
            notifyReceived,
            notifySent,
          } = await this.preProcessNotification(response?.nft_transfer);

          // Get sent nft notification
          const nftTransferSent =
            await this.notificationUtil.processNftTransferNotification(
              notifySent,
              watchList?.filter(
                (item) => !!item.settings && item.settings['nftSent'],
              ),
              notificationTokens,
              privateNameTags,
              publicNameTags,
            );

          // Get received nft notification
          const nftTransferReceived =
            await this.notificationUtil.processNftTransferNotification(
              notifyReceived,
              watchList?.filter(
                (item) => !!item.settings && item.settings['nftReceived'],
              ),
              notificationTokens,
              privateNameTags,
              publicNameTags,
            );

          // Process notification and push to firebase
          await this.processNotification(
            [...nftTransferSent, ...nftTransferReceived],
            currentTxHeight,
            response?.nft_transfer[0],
          );
        }
      }
    } catch (err) {
      this.logger.error(`notificationNftTransfer has error: ${err.stack}`);
    }
  }

  @Process(QUEUES.NOTIFICATION.JOBS.RESET_NOTIFICATION)
  async resetNotification() {
    try {
      const userActivities = await this.userActivityRepository.find({
        where: {
          type: USER_ACTIVITIES.DAILY_NOTIFICATIONS,
        },
      });

      userActivities?.forEach((item) => {
        item.total = 0;
      });

      // Reset quota limit.
      await this.userActivityRepository.save(userActivities);

      // Clean transaction over 30 days.
      await this.notificationReposiotry.cleanUp(
        this.configService.get('clean_notification_days'),
      );
    } catch (err) {
      this.logger.error(`resetNotification has error: ${err.stack}`);
    }
  }

  @OnQueueActive()
  onActive(job: Job) {
    this.logger.log(`Processing job ${job.id} of type ${job.name}...`);
  }

  @OnQueueCompleted()
  async onComplete(job: Job) {
    this.logger.log(`Completed job ${job.id} of type ${job.name}`);
  }

  @OnQueueError()
  onError(job: Job, error: Error) {
    this.logger.error(`Job: ${job}`);
    this.logger.error(`Error job ${job.id} of type ${job.name}`);
    this.logger.error(`Error: ${error}`);
  }

  @OnQueueFailed()
  async onFailed(job: Job, error: Error) {
    this.logger.error(`Failed job ${job.id} of type ${job.name}`);
    this.logger.error(`Error: ${error}`);
  }

  private async sendNotification(notification: NotificationDto) {
    return firebaseAdmin
      .messaging()
      .send({
        notification: {
          title: notification.title,
          body: notification.body['content'],
        },
        token: notification.token,
        data: {
          txHash: notification.tx_hash,
          image: notification.image || '',
        },
      })
      .catch((error) => this.logger.error('cannot-send-notfitication', error));
  }

  private async blockLimitNotification(notifiactions: NotificationDto[]) {
    const counts = {};
    for (const element of notifiactions) {
      if (counts.hasOwnProperty(element.user_id)) {
        counts[element.user_id]++;
      } else {
        counts[element.user_id] = 1;
      }
    }

    for (const [userId, count] of Object.entries(counts)) {
      const userActivities = await this.userActivityRepository.findOne({
        where: {
          user: { id: Number(userId) },
          type: USER_ACTIVITIES.DAILY_NOTIFICATIONS,
        },
      });
      const total = userActivities.total + Number(count) || 0;
      await this.userActivityRepository.update(userActivities.id, {
        total: total,
      });

      if (total >= NOTIFICATION.LIMIT) {
        this.watchListRepository.update(
          { user: { id: Number(userId) } },
          {
            tracking: false,
          },
        );
      }
    }
  }

  private async updateBlockNotification(type, syncPoint = null) {
    const data = await lastValueFrom(
      this.httpService.get(
        `${process.env.INDEXER_V2_URL}api/v2/statistics/dashboard?chainid=${this.indexerChainId}`,
      ),
    ).then((rs) => rs.data);
    if (syncPoint) {
      await this.syncPointRepos.update(syncPoint.id, {
        point: data?.total_blocks,
      });
    } else {
      await this.syncPointRepos.save({
        type: type,
        point: data?.total_blocks,
      });
    }
  }

  private async preProcessNotification(response: any = null) {
    const privateNameTags = await this.privateNameTagRepository.find();
    const publicNameTags = await this.publicNameTagRepository.find();
    const notificationTokens = await this.notificationTokenRepository.find({
      where: { status: NOTIFICATION.STATUS.ACTIVE },
      relations: ['user'],
    });

    return {
      privateNameTags,
      publicNameTags,
      notificationTokens,
      notifyReceived: response
        ? this.notificationUtil.getTxNotifyReceived(response)
        : [],
      notifySent: response
        ? this.notificationUtil.getTxNotifySent(response)
        : [],
    };
  }

  private async processNotification(
    notifications: NotificationDto[],
    currentTxHeight: SyncPoint,
    response: any,
  ) {
    // Push notifcation to firebase
    if (notifications?.length > 0) {
      const firebaseMessagingPromises = notifications.map((notification) =>
        this.sendNotification(notification),
      );
      await Promise.all(firebaseMessagingPromises);
      // Store notification to DB
      await this.notificationReposiotry.save(notifications);
    }
    // Update sync point nft transfer
    await this.syncPointRepos.update(currentTxHeight.id, {
      point: response?.height,
    });
    // Process limit when 100 notification per day
    await this.blockLimitNotification(notifications);
  }
}