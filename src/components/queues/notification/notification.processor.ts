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
import * as util from 'util';
import { PrivateNameTagRepository } from '../../private-name-tag/repositories/private-name-tag.repository';
import { PublicNameTagRepository } from '../../public-name-tag/repositories/public-name-tag.repository';
import { NotificationTokenRepository } from './repositories/notification-token.repository';
import { NotificationUtil } from './utils/notification.util';
import { NotificationDto } from './dtos/notification.dtos';
import { UserActivity } from '../../../shared/entities/user-activity.entity';
import { In, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { NotificationRepository } from './repositories/notification.repository';
import { WatchList } from '../../../shared/entities/watch-list.entity';
import { SyncPoint } from '../../../shared/entities/sync-point.entity';
import { EncryptionService } from '../../../components/encryption/encryption.service';
import { NotificationToken } from '../../../shared/entities/notification-token.entity';
import { User } from '../../../shared/entities/user.entity';
import { Explorer } from 'src/shared/entities/explorer.entity';

@Processor(QUEUES.NOTIFICATION.QUEUE_NAME)
export class NotificationProcessor {
  private readonly logger = new Logger(NotificationProcessor.name);
  private notificationConfig;

  constructor(
    private serviceUtil: ServiceUtil,
    private configService: ConfigService,
    private httpService: HttpService,
    private syncPointRepos: SyncPointRepository,
    private notificationUtil: NotificationUtil,
    private privateNameTagRepository: PrivateNameTagRepository,
    private publicNameTagRepository: PublicNameTagRepository,
    private notificationTokenRepository: NotificationTokenRepository,
    private encryptionService: EncryptionService,
    private notificationRepository: NotificationRepository,
    @InjectRepository(UserActivity)
    private userActivityRepository: Repository<UserActivity>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(WatchList)
    private watchListRepository: Repository<WatchList>,
    @InjectQueue(QUEUES.NOTIFICATION.QUEUE_NAME) private readonly queue: Queue,
    @InjectRepository(Explorer)
    private readonly explorerRepository: Repository<Explorer>,
  ) {
    this.logger.log(
      '============== Constructor NotificationProcessor Service ==============',
    );
    this.notificationConfig = this.configService.get('notification');
    firebaseAdmin.initializeApp({
      credential: firebaseAdmin.credential.cert({
        projectId: this.notificationConfig.fcmProjectId,
        privateKey: Buffer.from(
          this.notificationConfig.fcmPrivateKey,
          'base64',
        ).toString('ascii'),
        clientEmail: this.notificationConfig.fcmClientEmail,
      }),
    });
  }

  async onModuleInit() {
    this.queue.add(
      QUEUES.NOTIFICATION.JOBS.RESET_NOTIFICATION,
      {},
      {
        repeat: { cron: CronExpression.EVERY_DAY_AT_MIDNIGHT },
      },
    );

    const explorer = await this.explorerRepository.find();
    explorer?.forEach((item, index) => {
      // Every 30s + index
      const cronTime = 30 + index;
      this.queue.add(
        QUEUES.NOTIFICATION.JOBS.NOTIFICATION_EXECUTED,
        { explorer: item },
        {
          repeat: { cron: `*/${cronTime.toString()} * * * * *` },
        },
      );
      this.queue.add(
        QUEUES.NOTIFICATION.JOBS.NOTIFICATION_COIN_TRANSFER,
        { explorer: item },
        {
          repeat: { cron: `*/${cronTime.toString()} * * * * *` },
        },
      );
      this.queue.add(
        QUEUES.NOTIFICATION.JOBS.NOTIFICATION_NFT_TRANSFER,
        { explorer: item },
        {
          repeat: { cron: `*/${cronTime.toString()} * * * * *` },
        },
      );
      this.queue.add(
        QUEUES.NOTIFICATION.JOBS.NOTIFICATION_TOKEN_TRANSFER,
        { explorer: item },
        {
          repeat: { cron: `*/${cronTime.toString()} * * * * *` },
        },
      );
    });
  }

  @Process(QUEUES.NOTIFICATION.JOBS.NOTIFICATION_EXECUTED)
  async notificationExecuted(job: Job) {
    try {
      const explorer: Explorer = job.data.explorer;

      const currentTxHeight = await this.syncPointRepos.findOne({
        where: {
          type: SYNC_POINT_TYPE.EXECUTED_HEIGHT,
          explorer: { id: explorer.id },
        },
      });

      if (!currentTxHeight) {
        await this.updateBlockNotification(
          SYNC_POINT_TYPE.EXECUTED_HEIGHT,
          explorer,
        );
        return;
      }

      // Get watch list
      const watchList = await this.queryWatchList(explorer);
      if (watchList.length > 0) {
        const graphQlQuery = {
          query: util.format(
            INDEXER_API_V2.GRAPH_QL.EXECUTED_NOTIFICATION,
            explorer.chainDb,
          ),
          variables: {
            heightGT: currentTxHeight.point,
          },
          operationName: INDEXER_API_V2.OPERATION_NAME.EXECUTED_NOTIFICATION,
        };

        const response = (
          await this.serviceUtil.fetchDataFromGraphQL(graphQlQuery)
        )?.data[explorer.chainDb];
        if (response?.executed?.length > 0) {
          // get list address
          let listAddress = [];
          response.executed.forEach((element) => {
            const address = element.transaction_messages?.map(
              (msg) => msg.sender,
            );
            listAddress = [...listAddress, ...address];
          });

          // Pre-Process
          const { notificationTokens, privateNameTags, publicNameTags } =
            await this.preProcessNotification(null, listAddress, explorer);

          // Get executed notification
          const notifications =
            await this.notificationUtil.processExecutedNotification(
              response.executed,
              watchList.filter(
                (item) =>
                  !!item.settings && item.settings['transactionExecuted'],
              ),
              privateNameTags,
              publicNameTags,
              explorer,
            );

          // Process notification and push to firebase
          await this.processNotification(
            notifications,
            notificationTokens,
            currentTxHeight,
            response?.executed[0],
            explorer,
          );
        }
      }
    } catch (err) {
      this.logger.error(`notificationExecuted has error: ${err.stack}`);
    }
  }

  @Process(QUEUES.NOTIFICATION.JOBS.NOTIFICATION_COIN_TRANSFER)
  async notificationCoinTransfer(job: Job) {
    try {
      const explorer: Explorer = job.data.explorer;
      const currentTxHeight = await this.syncPointRepos.findOne({
        where: {
          type: SYNC_POINT_TYPE.COIN_TRANSFER_HEIGHT,
          explorer: { id: explorer.id },
        },
      });

      if (!currentTxHeight) {
        await this.updateBlockNotification(
          SYNC_POINT_TYPE.COIN_TRANSFER_HEIGHT,
          explorer,
        );
        return;
      }

      // Get watch list
      const watchList = await this.queryWatchList(explorer);
      if (watchList.length > 0) {
        const graphQlQuery = {
          query: util.format(
            INDEXER_API_V2.GRAPH_QL.COIN_TRANSFER_NOTIFICATION,
            explorer.chainDb,
          ),
          variables: {
            heightGT: currentTxHeight.point,
          },
          operationName:
            INDEXER_API_V2.OPERATION_NAME.COIN_TRANSFER_NOTIFICATION,
        };

        const response = (
          await this.serviceUtil.fetchDataFromGraphQL(graphQlQuery)
        )?.data[explorer.chainDb];

        if (response?.coin_transfer?.length > 0) {
          // Convert data coin transfer
          const listTx = await this.notificationUtil.convertDataCoinTransfer(
            response.coin_transfer,
            explorer,
          );

          // Get list address
          const listAddress = [
            ...listTx.map((element) => element.from),
            ...listTx.map((element) => element.to),
          ];

          // Pre-Process
          const {
            notificationTokens,
            privateNameTags,
            publicNameTags,
            notifyReceived,
            notifySent,
          } = await this.preProcessNotification(listTx, listAddress, explorer);

          // Get received native coin notification
          const coinTransferReceived =
            await this.notificationUtil.processCoinTransferNotification(
              notifyReceived,
              watchList.filter(
                (item) =>
                  !!item.settings && item.settings['nativeCoinReceived'].turnOn,
              ),
              privateNameTags,
              publicNameTags,
              explorer,
            );

          // Get sent native coin notification
          const coinTransferSent =
            await this.notificationUtil.processCoinTransferNotification(
              notifySent,
              watchList.filter(
                (item) =>
                  !!item.settings && item.settings['nativeCoinSent'].turnOn,
              ),
              privateNameTags,
              publicNameTags,
              explorer,
            );

          // Process notification and push to firebase
          await this.processNotification(
            [...coinTransferSent, ...coinTransferReceived],
            notificationTokens,
            currentTxHeight,
            response?.coin_transfer[0],
            explorer,
          );
        }
      }
    } catch (err) {
      this.logger.error(`notificationCoinTransfer has error: ${err.stack}`);
    }
  }

  @Process(QUEUES.NOTIFICATION.JOBS.NOTIFICATION_TOKEN_TRANSFER)
  async notificationTokenTransfer(job: Job) {
    try {
      const explorer: Explorer = job.data.explorer;
      const currentTxHeight = await this.syncPointRepos.findOne({
        where: {
          type: SYNC_POINT_TYPE.TOKEN_TRANSFER_HEIGHT,
          explorer: { id: explorer.id },
        },
      });

      if (!currentTxHeight) {
        await this.updateBlockNotification(
          SYNC_POINT_TYPE.TOKEN_TRANSFER_HEIGHT,
          explorer,
        );
        return;
      }

      // Get watch list
      const watchList = await this.queryWatchList(explorer);
      if (watchList.length > 0) {
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
        )?.data[explorer.chainDb];

        if (response?.token_transfer?.length > 0) {
          // Get list address
          const listAddress = [
            ...response.token_transfer.map((element) => element.from),
            ...response.token_transfer.map((element) => element.to),
          ];

          // Pre-Process
          const {
            notificationTokens,
            privateNameTags,
            publicNameTags,
            notifyReceived,
            notifySent,
          } = await this.preProcessNotification(
            response.token_transfer,
            listAddress,
            explorer,
          );

          // Get received token notification
          const nftTransferSent =
            await this.notificationUtil.processTokenTransferNotification(
              notifySent,
              watchList.filter(
                (item) => !!item.settings && item.settings['tokenSent'],
              ),
              privateNameTags,
              publicNameTags,
              explorer,
            );

          // Get sent token notification
          const nftTransferReceived =
            await this.notificationUtil.processTokenTransferNotification(
              notifyReceived,
              watchList.filter(
                (item) => !!item.settings && item.settings['tokenReceived'],
              ),
              privateNameTags,
              publicNameTags,
              explorer,
            );

          // Process notification and push to firebase
          await this.processNotification(
            [...nftTransferReceived, ...nftTransferSent],
            notificationTokens,
            currentTxHeight,
            response?.token_transfer[0],
            explorer,
          );
        }
      }
    } catch (err) {
      this.logger.error(`notificationTokenTransfer has error: ${err.stack}`);
    }
  }

  @Process(QUEUES.NOTIFICATION.JOBS.NOTIFICATION_NFT_TRANSFER)
  async notificationNftTransfer(job: Job) {
    try {
      const explorer: Explorer = job.data.explorer;
      const currentTxHeight = await this.syncPointRepos.findOne({
        where: {
          type: SYNC_POINT_TYPE.NFT_TRANSFER_HEIGHT,
          explorer: { id: explorer.id },
        },
      });

      if (!currentTxHeight) {
        await this.updateBlockNotification(
          SYNC_POINT_TYPE.NFT_TRANSFER_HEIGHT,
          explorer,
        );
        return;
      }

      // Get watch list
      const watchList = await this.queryWatchList(explorer);
      if (watchList.length > 0) {
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
        )?.data[explorer.chainDb];

        if (response?.nft_transfer?.length > 0) {
          // Get list address
          const listAddress = [
            ...response.nft_transfer.map((element) => element.from),
            ...response.nft_transfer.map((element) => element.to),
          ];

          // Pre-Process
          const {
            notificationTokens,
            privateNameTags,
            publicNameTags,
            notifyReceived,
            notifySent,
          } = await this.preProcessNotification(
            response.nft_transfer,
            listAddress,
            explorer,
          );

          // Get sent nft notification
          const nftTransferSent =
            await this.notificationUtil.processNftTransferNotification(
              notifySent,
              watchList.filter(
                (item) => !!item.settings && item.settings['nftSent'],
              ),
              privateNameTags,
              publicNameTags,
              explorer,
            );

          // Get received nft notification
          const nftTransferReceived =
            await this.notificationUtil.processNftTransferNotification(
              notifyReceived,
              watchList.filter(
                (item) => !!item.settings && item.settings['nftReceived'],
              ),
              privateNameTags,
              publicNameTags,
              explorer,
            );

          // Process notification and push to firebase
          await this.processNotification(
            [...nftTransferSent, ...nftTransferReceived],
            notificationTokens,
            currentTxHeight,
            response?.nft_transfer[0],
            explorer,
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
      await this.notificationRepository.cleanUp(
        this.notificationConfig.cleanNotificationDays,
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

  private async sendNotification(notification: NotificationDto, token: string) {
    return firebaseAdmin
      .messaging()
      .send({
        notification: {
          title: notification.title,
          body: notification.body['content'],
        },
        token: token,
        data: {
          txHash: notification.tx_hash,
          image: notification.image || '',
        },
      })
      .catch((error) => this.logger.error('cannot-send-notification', error));
  }

  private async blockLimitNotification(
    notifications: NotificationDto[],
    explorer: Explorer,
  ) {
    const counts = {};
    for (const element of notifications) {
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
          explorer: { id: explorer.id },
        },
        relations: ['explorer'],
      });
      if (userActivities) {
        const currentTotal = userActivities.total || 0;
        const total = currentTotal + Number(count) || 0;
        await this.userActivityRepository.update(userActivities.id, {
          total: total,
        });

        if (total >= this.notificationConfig.limitNotifications) {
          this.watchListRepository.update(
            { user: { id: Number(userId) }, explorer: { id: explorer.id } },
            {
              tracking: false,
            },
          );
        }
      } else {
        const user = await this.usersRepository.findOne({
          where: { id: userId },
        });
        const activity = new UserActivity();
        activity.type = USER_ACTIVITIES.DAILY_NOTIFICATIONS;
        activity.user = user;
        activity.total = 1;
        await this.userActivityRepository.save(activity);
      }
    }
  }

  private async updateBlockNotification(
    type,
    explorer: Explorer,
    syncPoint = null,
  ) {
    const data = await lastValueFrom(
      this.httpService.get(
        `${process.env.INDEXER_V2_URL}api/v2/statistics/dashboard?chainid=${explorer.chainId}`,
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
        explorer: explorer,
      });
    }
  }

  private async preProcessNotification(
    response: any,
    listAddress: string[],
    explorer: Explorer,
  ) {
    const result = await this.privateNameTagRepository.find({
      where: { address: In(listAddress), explorer: { id: explorer.id } },
      relations: ['explorer'],
    });
    const privateNameTags = await Promise.all(
      result.map(async (item) => {
        item.nameTag = await this.encryptionService.decrypt(item.nameTag);
        return item;
      }),
    );
    const publicNameTags = await this.publicNameTagRepository.find({
      where: { address: In(listAddress), explorer: { id: explorer.id } },
      relations: ['explorer'],
    });
    const fcmToken = await this.notificationTokenRepository.find({
      where: { status: NOTIFICATION.STATUS.ACTIVE },
      relations: [
        'user',
        'user.userActivities',
        'user.userActivities.explorer',
      ],
    });

    // Filter fcm token less than 100 notification per days.
    const notificationTokens = fcmToken.filter((item) => {
      const dailyNotification = item.user?.userActivities?.find(
        (activity) =>
          activity.type === USER_ACTIVITIES.DAILY_NOTIFICATIONS &&
          activity.explorer.id === explorer.id,
      );
      return dailyNotification?.total >=
        this.notificationConfig.limitNotifications
        ? false
        : true;
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
    notificationTokens: NotificationToken[],
    currentTxHeight: SyncPoint,
    response: any,
    explorer: Explorer,
  ) {
    // Push notification to firebase
    if (notifications?.length > 0) {
      const firebaseMessagingPromises = notifications.map((notification) => {
        const fcmTokens = notificationTokens
          ?.filter((item) => item.user.id === notification.user_id)
          .map((item) => item.notification_token);
        fcmTokens.forEach((token) => {
          this.sendNotification(notification, token);
        });
      });
      await Promise.all(firebaseMessagingPromises);
      // Store notification to DB
      await this.notificationRepository.save(notifications);
    }
    // Update sync point nft transfer
    await this.syncPointRepos.update(currentTxHeight.id, {
      point: response?.height,
    });
    // Process limit when 100 notification per day
    await this.blockLimitNotification(notifications, explorer);
  }

  private async queryWatchList(explorer: Explorer) {
    // Get all watch list with tracking true
    const watchList = await this.watchListRepository.find({
      where: {
        tracking: true,
        explorer: { id: explorer.id },
      },
      relations: [
        'user',
        'user.userActivities',
        'user.userActivities.explorer',
      ],
    });

    // Filter watch list less than 100 notification per days.
    const watchListFilter = watchList.filter((item) => {
      const dailyNotification = item.user?.userActivities?.find(
        (activity) =>
          activity.type === USER_ACTIVITIES.DAILY_NOTIFICATIONS &&
          activity.explorer.id === explorer.id,
      );
      return dailyNotification?.total >=
        this.notificationConfig.limitNotifications
        ? false
        : true;
    });

    return watchListFilter;
  }
}
