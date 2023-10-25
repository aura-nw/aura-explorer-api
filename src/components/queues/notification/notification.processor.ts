import { InjectQueue, Process, Processor } from '@nestjs/bull';
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
import { Queue } from 'bull';
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
    @InjectRepository(UserActivity)
    private userActivityRepository: Repository<UserActivity>,
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
        // ======================
        let watchList = [];
        response?.executed?.forEach((element) => {
          watchList.push({
            address: element.transaction_messages[0].sender,
            userId: 1,
          });
        });
        watchList = watchList.filter(
          (item, index) =>
            watchList.map((item) => item.address).indexOf(item.address) ===
            index,
        );
        // ======================

        const privateNameTags = await this.privateNameTagRepository.find();
        const publicNameTags = await this.publicNameTagRepository.find();
        const notificationTokens = await this.notificationTokenRepository.find({
          where: { status: NOTIFICATION.STATUS.ACTIVE },
        });

        const notifications =
          await this.notificationUtil.processExecutedNotification(
            response,
            watchList,
            notificationTokens,
            privateNameTags,
            publicNameTags,
          );

        if (notifications?.length > 0) {
          const firebaseMessagingPromises = notifications.map((notification) =>
            this.sendNotification(notification),
          );
          await Promise.all(firebaseMessagingPromises);
        }
        await this.syncPointRepos.update(currentTxHeight.id, {
          point: response?.executed[0].height,
        });
        await this.blockLimitNotification(notifications);
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

      const graphQlQuery = {
        query: INDEXER_API_V2.GRAPH_QL.COIN_TRANSFER_NOTIFICATION,
        variables: {
          heightGT: currentTxHeight.point,
          compositeKeyIn: ['transfer.sender', 'transfer.recipient'],
        },
        operationName: INDEXER_API_V2.OPERATION_NAME.COIN_TRANSFER_NOTIFICATION,
      };

      const response = (
        await this.serviceUtil.fetchDataFromGraphQL(graphQlQuery)
      )?.data[this.chainDB];

      if (response?.coin_transfer.length > 0) {
        const privateNameTags = await this.privateNameTagRepository.find();
        const publicNameTags = await this.publicNameTagRepository.find();
        const notificationTokens = await this.notificationTokenRepository.find({
          where: { status: NOTIFICATION.STATUS.ACTIVE },
        });

        const listTx = await this.notificationUtil.convertDataCoinTransfer(
          response?.coin_transfer,
        );

        const notifyToTx = this.notificationUtil.getTxNotifyTo(listTx);
        // ======================
        let watchList = [];
        notifyToTx?.forEach((element) => {
          watchList.push({ address: element.to, userId: 1 });
        });
        watchList = watchList.filter(
          (item, index) =>
            watchList.map((item) => item.address).indexOf(item.address) ===
            index,
        );
        // ======================
        const coinTransferTo =
          await this.notificationUtil.processCoinTransferNotification(
            notifyToTx,
            watchList,
            notificationTokens,
            privateNameTags,
            publicNameTags,
          );

        const notifyFromTx = this.notificationUtil.getTxNotifyFrom(listTx);
        // ======================
        watchList = [];
        notifyFromTx?.forEach((element) => {
          watchList.push({ address: element.from, userId: 1 });
        });
        watchList = watchList.filter(
          (item, index) =>
            watchList.map((item) => item.address).indexOf(item.address) ===
            index,
        );
        // ======================
        const coinTransferFrom =
          await this.notificationUtil.processCoinTransferNotification(
            notifyFromTx,
            watchList,
            notificationTokens,
            privateNameTags,
            publicNameTags,
          );
        const notifications = [...coinTransferFrom, ...coinTransferTo];
        if (notifications?.length > 0) {
          const firebaseMessagingPromises = notifications.map((notification) =>
            this.sendNotification(notification),
          );
          await Promise.all(firebaseMessagingPromises);
        }
        await this.syncPointRepos.update(currentTxHeight.id, {
          point: response?.coin_transfer[0].height,
        });
        await this.blockLimitNotification(notifications);
      } else {
        this.updateBlockNotification(
          SYNC_POINT_TYPE.COIN_TRANSFER_HEIGHT,
          currentTxHeight,
        );
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

      if (response?.token_transfer.length > 0) {
        const privateNameTags = await this.privateNameTagRepository.find();
        const publicNameTags = await this.publicNameTagRepository.find();
        const notificationTokens = await this.notificationTokenRepository.find({
          where: { status: NOTIFICATION.STATUS.ACTIVE },
        });

        const notifyFromTx = this.notificationUtil.getTxNotifyFrom(
          response?.token_transfer,
        );
        // ======================
        let watchList = [];
        notifyFromTx?.forEach((element) => {
          watchList.push({ address: element.from, userId: 1 });
        });
        watchList = watchList.filter(
          (item, index) =>
            watchList.map((item) => item.address).indexOf(item.address) ===
            index,
        );
        // ======================
        const nftTransferFrom =
          await this.notificationUtil.processTokenTransferNotification(
            notifyFromTx,
            watchList,
            notificationTokens,
            privateNameTags,
            publicNameTags,
          );

        const notifyToTx = this.notificationUtil.getTxNotifyTo(
          response?.token_transfer,
        );
        // ======================
        watchList = [];
        notifyToTx?.forEach((element) => {
          watchList.push({ address: element.to, userId: 1 });
        });
        watchList = watchList.filter(
          (item, index) =>
            watchList.map((item) => item.address).indexOf(item.address) ===
            index,
        );
        // ======================
        const nftTransferTo =
          await this.notificationUtil.processTokenTransferNotification(
            notifyToTx,
            watchList,
            notificationTokens,
            privateNameTags,
            publicNameTags,
          );

        const notifications = [...nftTransferFrom, ...nftTransferTo];

        if (notifications?.length > 0) {
          const firebaseMessagingPromises = notifications.map((notification) =>
            this.sendNotification(notification),
          );
          await Promise.all(firebaseMessagingPromises);
        }

        await this.syncPointRepos.update(currentTxHeight.id, {
          point: response?.token_transfer[0].height,
        });

        await this.blockLimitNotification(notifications);
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

      const graphQlQuery = {
        query: INDEXER_API_V2.GRAPH_QL.NFT_TRANSFER_NOTIFICATION,
        variables: {
          heightGT: currentTxHeight.point,
          listFilterCW721: ['mint', 'burn', 'transfer_nft', 'send_nft'],
        },
        operationName: INDEXER_API_V2.OPERATION_NAME.NFT_TRANSFER_NOTIFICATION,
      };

      const response = (
        await this.serviceUtil.fetchDataFromGraphQL(graphQlQuery)
      )?.data[this.chainDB];

      if (response?.nft_transfer.length > 0) {
        const privateNameTags = await this.privateNameTagRepository.find();
        const publicNameTags = await this.publicNameTagRepository.find();
        const notificationTokens = await this.notificationTokenRepository.find({
          where: { status: NOTIFICATION.STATUS.ACTIVE },
        });

        const notifyFromTx = this.notificationUtil.getTxNotifyFrom(
          response?.nft_transfer,
        );

        // ======================
        let watchList = [];
        notifyFromTx?.forEach((element) => {
          watchList.push({ address: element.from, userId: 1 });
        });
        watchList = watchList.filter(
          (item, index) =>
            watchList.map((item) => item.address).indexOf(item.address) ===
            index,
        );
        // ======================
        const nftTransferFrom =
          await this.notificationUtil.processNftTransferNotification(
            notifyFromTx,
            watchList,
            notificationTokens,
            privateNameTags,
            publicNameTags,
          );

        const notifyToTx = this.notificationUtil.getTxNotifyTo(
          response?.nft_transfer,
        );
        // ======================
        watchList = [];
        notifyToTx?.forEach((element) => {
          watchList.push({ address: element.to, userId: 1 });
        });
        watchList = watchList.filter(
          (item, index) =>
            watchList.map((item) => item.address).indexOf(item.address) ===
            index,
        );
        // ======================
        const nftTransferTo =
          await this.notificationUtil.processNftTransferNotification(
            notifyToTx,
            watchList,
            notificationTokens,
            privateNameTags,
            publicNameTags,
          );
        const notifications = [...nftTransferFrom, ...nftTransferTo];
        if (notifications?.length > 0) {
          const firebaseMessagingPromises = notifications.map((notification) =>
            this.sendNotification(notification),
          );
          await Promise.all(firebaseMessagingPromises);
        }

        await this.syncPointRepos.update(currentTxHeight.id, {
          point: response?.nft_transfer[0].height,
        });

        await this.blockLimitNotification(notifications);
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

      await this.userActivityRepository.save(userActivities);
    } catch (err) {
      this.logger.error(`resetNotification has error: ${err.stack}`);
    }
  }

  private async sendNotification(notification: NotificationDto) {
    return firebaseAdmin
      .messaging()
      .send({
        notification: {
          title: notification.title,
          body: notification.body,
        },
        token: notification.token,
        data: {
          txHash: notification.txHash,
          image: notification.image || '',
        },
      })
      .catch((error) => this.logger.error('cannot-send-notfitication', error));
  }

  private async blockLimitNotification(notifiactions: NotificationDto[]) {
    const counts = {};
    for (const element of notifiactions) {
      if (counts.hasOwnProperty(element.userId)) {
        counts[element.userId]++;
      } else {
        counts[element.userId] = 1;
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
        this.notificationTokenRepository.update(
          { user_id: Number(userId), status: NOTIFICATION.STATUS.ACTIVE },
          { status: NOTIFICATION.STATUS.INACTIVE },
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
}
