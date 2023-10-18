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
import * as firebaseAdmin from 'firebase-admin';
import { TransactionHelper } from '../../../shared/helpers/transaction.helper';
import { PrivateNameTagRepository } from '../../private-name-tag/repositories/private-name-tag.repository';
import { PublicNameTagRepository } from '../../public-name-tag/repositories/public-name-tag.repository';
import { PrivateNameTag } from '../../../shared/entities/private-name-tag.entity';
import { PublicNameTag } from '../../../shared/entities/public-name-tag.entity';
import { Notification } from './dtos/notification.dtos';
import { NotificationTokenRepository } from './repositories/notification-token.repository';
import { NotificationToken } from '../../../shared/entities/notification-token.entity';
import * as appConfig from '../../../shared/configs/configuration';

@Processor(QUEUES.NOTIFICATION.QUEUE_NAME)
export class NotificationProcessor {
  private readonly logger = new Logger(NotificationProcessor.name);
  private indexerChainId;
  private chainDB;
  private config;

  constructor(
    private serviceUtil: ServiceUtil,
    private configService: ConfigService,
    private httpService: HttpService,
    private syncPointRepos: SyncPointRepository,
    private privateNameTagRepository: PrivateNameTagRepository,
    private publicNameTagRepository: PublicNameTagRepository,
    private notificationTokenRepository: NotificationTokenRepository,

    @InjectQueue(QUEUES.NOTIFICATION.QUEUE_NAME) private readonly queue: Queue,
  ) {
    this.logger.log(
      '============== Constructor CW4973Processor Service ==============',
    );
    this.config = appConfig.default();
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
        const data = await lastValueFrom(
          this.httpService.get(
            `${process.env.INDEXER_V2_URL}api/v2/statistics/dashboard?chainid=${this.indexerChainId}`,
          ),
        ).then((rs) => rs.data);
        await this.syncPointRepos.save({
          type: SYNC_POINT_TYPE.EXECUTED_HEIGHT,
          point: data?.total_blocks,
        });
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
        const notificationTokens =
          await this.notificationTokenRepository.find();
        const notifications = await this.processExecutedNotification(
          response,
          watchList,
          notificationTokens,
          privateNameTags,
          publicNameTags,
        );

        const firebaseMessagingPromises = notifications.map((notification) =>
          this.sendNotification(notification),
        );
        await Promise.all(firebaseMessagingPromises);
        await this.syncPointRepos.update(currentTxHeight.id, {
          point: response?.executed[0].height,
        });
      }
    } catch (err) {
      this.logger.error(`notificationExecuted has error: ${err.stack}`);
    }
  }

  //@Process(QUEUES.NOTIFICATION.JOBS.NOTIFICATION_COIN_TRANSFER)
  async notificationCoinTransfer() {
    try {
      const currentTxHeight = await this.syncPointRepos.findOne({
        where: {
          type: SYNC_POINT_TYPE.COIN_TRANSFER_HEIGHT,
        },
      });

      if (!currentTxHeight) {
        const data = await lastValueFrom(
          this.httpService.get(
            `${process.env.INDEXER_V2_URL}api/v2/statistics/dashboard?chainid=${this.indexerChainId}`,
          ),
        ).then((rs) => rs.data);
        await this.syncPointRepos.save({
          type: SYNC_POINT_TYPE.COIN_TRANSFER_HEIGHT,
          point: data?.total_blocks,
        });
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
        const notificationTokens =
          await this.notificationTokenRepository.find();

        const listTx = await this.convertDataCoinTransfer(
          response?.coin_transfer,
        );

        const notifyToTx = this.getTxNotifyTo(listTx);
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
        const coinTransferTo = await this.processCoinTransferNotification(
          notifyToTx,
          watchList,
          notificationTokens,
          privateNameTags,
          publicNameTags,
        );

        const notifyFromTx = this.getTxNotifyFrom(listTx);
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
        const coinTransferFrom = await this.processCoinTransferNotification(
          notifyFromTx,
          watchList,
          notificationTokens,
          privateNameTags,
          publicNameTags,
        );
        const notifications = [...coinTransferFrom, ...coinTransferTo];
        const firebaseMessagingPromises = notifications.map((notification) =>
          this.sendNotification(notification),
        );
        await Promise.all(firebaseMessagingPromises);

        await this.syncPointRepos.update(currentTxHeight.id, {
          point: response?.coin_transfer[0].height,
        });
      }
    } catch (err) {
      this.logger.error(`notificationCoinTransfer has error: ${err.stack}`);
    }
  }

  //@Process(QUEUES.NOTIFICATION.JOBS.NOTIFICATION_TOKEN_TRANSFER)
  async notificationTokenTransfer() {
    try {
      const currentTxHeight = await this.syncPointRepos.findOne({
        where: {
          type: SYNC_POINT_TYPE.TOKEN_TRANSFER_HEIGHT,
        },
      });

      if (!currentTxHeight) {
        const data = await lastValueFrom(
          this.httpService.get(
            `${process.env.INDEXER_V2_URL}api/v2/statistics/dashboard?chainid=${this.indexerChainId}`,
          ),
        ).then((rs) => rs.data);
        await this.syncPointRepos.save({
          type: SYNC_POINT_TYPE.TOKEN_TRANSFER_HEIGHT,
          point: data?.total_blocks,
        });
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
        const notificationTokens =
          await this.notificationTokenRepository.find();

        const notifyFromTx = this.getTxNotifyFrom(response?.token_transfer);
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
        const nftTransferFrom = await this.processTokenTransferNotification(
          notifyFromTx,
          watchList,
          notificationTokens,
          privateNameTags,
          publicNameTags,
        );

        const notifyToTx = this.getTxNotifyTo(response?.token_transfer);
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
        const nftTransferTo = await this.processTokenTransferNotification(
          notifyToTx,
          watchList,
          notificationTokens,
          privateNameTags,
          publicNameTags,
        );

        const notifications = [...nftTransferFrom, ...nftTransferTo];

        const firebaseMessagingPromises = notifications.map((notification) =>
          this.sendNotification(notification),
        );
        await Promise.all(firebaseMessagingPromises);

        await this.syncPointRepos.update(currentTxHeight.id, {
          point: response?.token_transfer[0].height,
        });
      }
    } catch (err) {
      this.logger.error(`notificationTokenTransfer has error: ${err.stack}`);
    }
  }

  //@Process(QUEUES.NOTIFICATION.JOBS.NOTIFICATION_NFT_TRANSFER)
  async notificationNftTransfer() {
    try {
      const currentTxHeight = await this.syncPointRepos.findOne({
        where: {
          type: SYNC_POINT_TYPE.NFT_TRANSFER_HEIGHT,
        },
      });

      if (!currentTxHeight) {
        const data = await lastValueFrom(
          this.httpService.get(
            `${process.env.INDEXER_V2_URL}api/v2/statistics/dashboard?chainid=${this.indexerChainId}`,
          ),
        ).then((rs) => rs.data);
        await this.syncPointRepos.save({
          type: SYNC_POINT_TYPE.NFT_TRANSFER_HEIGHT,
          point: data?.total_blocks,
        });
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
        const notificationTokens =
          await this.notificationTokenRepository.find();

        const notifyFromTx = this.getTxNotifyFrom(response?.nft_transfer);

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
        const nftTransferFrom = await this.processNftTransferNotification(
          notifyFromTx,
          watchList,
          notificationTokens,
          privateNameTags,
          publicNameTags,
        );

        const notifyToTx = this.getTxNotifyTo(response?.nft_transfer);
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
        const nftTransferTo = await this.processNftTransferNotification(
          notifyToTx,
          watchList,
          notificationTokens,
          privateNameTags,
          publicNameTags,
        );
        const notifications = [...nftTransferFrom, ...nftTransferTo];
        const firebaseMessagingPromises = notifications.map((notification) =>
          this.sendNotification(notification),
        );
        await Promise.all(firebaseMessagingPromises);

        await this.syncPointRepos.update(currentTxHeight.id, {
          point: response?.nft_transfer[0].height,
        });
      }
    } catch (err) {
      this.logger.error(`notificationNftTransfer has error: ${err.stack}`);
    }
  }

  private async processExecutedNotification(
    response,
    watchList,
    listNotificationToken: NotificationToken[],
    listPrivateNameTag: PrivateNameTag[],
    listPublicNameTag: PublicNameTag[],
  ) {
    const lstNotification: Notification[] = [];
    if (response?.executed?.length > 0) {
      response?.executed?.forEach((tx) => {
        tx.transaction_messages.forEach((msg) => {
          const listWatch = watchList.filter(
            (item) => item.address === msg.sender,
          );
          listWatch?.forEach((element) => {
            const type = TransactionHelper.getTypeTxMsg(
              tx.transaction_messages,
            );
            const nameTagPhase = this.getNameTag(
              element.address,
              element.userId,
              listPrivateNameTag,
              listPublicNameTag,
            );

            const notification = new Notification();
            notification.title = 'executed';
            notification.token = listNotificationToken?.find(
              (item) => item.user_id === element.userId,
            )?.notification_token;
            notification.txHash = tx.hash;
            notification.body = `New ${type} transaction initiated by ${msg.sender} ${nameTagPhase}`;
            lstNotification.push(notification);
          });
        });
      });
    }
    return lstNotification;
  }

  private async processCoinTransferNotification(
    data,
    watchList,
    listNotificationToken: NotificationToken[],
    listPrivateNameTag: PrivateNameTag[],
    listPublicNameTag: PublicNameTag[],
  ) {
    const lstNotification: Notification[] = [];
    data?.forEach((tx) => {
      const listTransfer = tx.activities
        ?.slice(0, 3)
        ?.map((item) => `${item.amount} ${item.denom}`)
        .join(',');

      const listWatch = watchList.filter(
        (item) => item.address === tx.from || item.address === tx.to,
      );
      listWatch?.forEach((element) => {
        const nameTagPhase = this.getNameTag(
          element.address,
          element.userId,
          listPrivateNameTag,
          listPublicNameTag,
        );

        const notification = new Notification();
        notification.token = listNotificationToken?.find(
          (item) => item.user_id === element.userId,
        )?.notification_token;
        notification.title = 'coin_transfer';
        notification.image = tx.image;
        notification.txHash = tx.tx_hash;
        notification.body = `${listTransfer} ${
          tx.activities.length > 3 ? 'and more ' : ''
        }${element.address === tx.to ? 'received' : 'sent'} by ${
          element.address
        }${nameTagPhase}`;
        lstNotification.push(notification);
      });
    });
    return lstNotification;
  }

  private async processTokenTransferNotification(
    data,
    watchList,
    listNotificationToken: NotificationToken[],
    listPrivateNameTag: PrivateNameTag[],
    listPublicNameTag: PublicNameTag[],
  ) {
    const lstNotification: Notification[] = [];
    data?.forEach((tx) => {
      const listTokenId = tx.activities
        ?.slice(0, 3)
        ?.map(
          (item) =>
            `${TransactionHelper.balanceOf(
              Number(item.amount) || 0,
              item.cw20_contract.decimal || 6,
            )} ${item.cw20_contract.symbol}`,
        )
        .join(',');

      const listWatch = watchList.filter(
        (item) => item.address === tx.from || item.address === tx.to,
      );
      listWatch?.forEach((element) => {
        const nameTagPhase = this.getNameTag(
          element.address,
          element.userId,
          listPrivateNameTag,
          listPublicNameTag,
        );

        const notification = new Notification();
        notification.token = listNotificationToken?.find(
          (item) => item.user_id === element.userId,
        )?.notification_token;
        notification.title = 'token_transfer';
        notification.image =
          tx.activities[0].cw20_contract?.marketing_info?.logo;
        notification.txHash = tx.tx_hash;
        notification.body = `${listTokenId} ${
          tx.activities.length > 2 ? 'and more ' : ''
        }${element.address === tx.to ? 'received' : 'sent'} by ${
          element.address
        }${nameTagPhase}`;
        lstNotification.push(notification);
      });
    });

    return lstNotification;
  }

  private async processNftTransferNotification(
    data,
    watchList,
    listNotificationToken: NotificationToken[],
    listPrivateNameTag: PrivateNameTag[],
    listPublicNameTag: PublicNameTag[],
  ) {
    const lstNotification: Notification[] = [];
    data?.forEach((tx) => {
      const listTokenId = tx.activities
        ?.slice(0, 2)
        ?.map((item) => item.cw721_token.token_id)
        .join(',');

      const listWatch = watchList.filter(
        (item) => item.address === tx.from || item.address === tx.to,
      );
      listWatch?.forEach((element) => {
        const nameTagPhase = this.getNameTag(
          element.address,
          element.userId,
          listPrivateNameTag,
          listPublicNameTag,
        );

        const notification = new Notification();
        notification.token = listNotificationToken?.find(
          (item) => item.user_id === element.userId,
        )?.notification_token;
        notification.title = 'nft_transfer';
        notification.image =
          tx.activities[0].cw721_token?.media_info?.offchain?.image?.url;
        notification.txHash = tx.tx_hash;
        notification.body = `NFT id ${listTokenId} ${
          tx.activities.length > 2 ? 'and more ' : ''
        }${element.address === tx.to ? 'received' : 'sent'} by ${
          element.address
        }${nameTagPhase}`;
        lstNotification.push(notification);
      });
    });
    return lstNotification;
  }

  private getNameTag(
    address: string,
    userId: number,
    listPrivateNameTag: PrivateNameTag[],
    listPublicNameTag: PublicNameTag[],
  ) {
    const privateNameTag = listPrivateNameTag.find(
      (item) => item.createdBy === userId && item.address === address,
    )?.nameTag;
    const publicNameTag = listPublicNameTag.find(
      (item) => item.address === address,
    )?.name_tag;

    const nameTagPhase = [];
    if (privateNameTag) {
      nameTagPhase.push(privateNameTag);
    }
    if (publicNameTag) {
      nameTagPhase.push(publicNameTag);
    }

    return nameTagPhase.length > 0 ? ` (${nameTagPhase.join(' / ')})` : '';
  }

  private getTxNotifyFrom(notifcations) {
    return Array.from(
      new Set(
        notifcations?.map((s) => {
          return JSON.stringify({ tx_hash: s.tx_hash, from: s.from });
        }),
      ),
    )
      .filter((item: string) => {
        const data = JSON.parse(item);
        return !!data.from;
      })
      .map((item: string) => {
        const data = JSON.parse(item);
        return {
          tx_hash: data.tx_hash,
          from: data.from,
          to: null,
          activities: notifcations?.filter((s) => {
            return s.tx_hash === data.tx_hash && s.from === data.from;
          }),
        };
      });
  }

  private getTxNotifyTo(notifcations) {
    return Array.from(
      new Set(
        notifcations?.map((s) => {
          return JSON.stringify({ tx_hash: s.tx_hash, to: s.to });
        }),
      ),
    )
      .filter((item: string) => {
        const data = JSON.parse(item);
        return !!data.to;
      })
      .map((item: string) => {
        const data = JSON.parse(item);
        return {
          tx_hash: data.tx_hash,
          to: data.to,
          from: null,
          activities: notifcations?.filter((s) => {
            return s.tx_hash === data.tx_hash && s.to === data.to;
          }),
        };
      });
  }

  private async convertDataCoinTransfer(data) {
    const envConfig = await lastValueFrom(
      this.httpService.get(this.config.configUrl),
    ).then((rs) => rs.data);

    const coinInfo = envConfig.chain_info.currencies[0];
    const coinConfig = envConfig.coins;
    const listTx = [];
    data?.forEach((tx) => {
      tx.events.forEach((evt) => {
        const toAddress = evt.event_attributes.find(
          (k) => k.composite_key === 'transfer.recipient',
        )?.value;
        const fromAddress = evt.event_attributes.find(
          (k) => k.composite_key === 'transfer.sender',
        )?.value;

        const rawAmount = evt.event_attributes?.find(
          (k) => k.composite_key === 'transfer.amount',
        )?.value;

        const value = rawAmount?.match(/\d+/g);
        const amountTemp = value?.length > 0 ? value[0] : 0;
        let amount;
        let image = '';
        let denom = coinInfo.coinDenom;
        if (rawAmount?.indexOf('ibc') > -1) {
          const dataIBC = TransactionHelper.getDataIBC(rawAmount, coinConfig);
          amount = TransactionHelper.balanceOf(
            Number(amountTemp) || 0,
            dataIBC['decimal'] || 6,
          );
          image = dataIBC['logo'] || '';
          denom =
            dataIBC['display'].indexOf('ibc') === -1
              ? 'ibc/' + dataIBC['display']
              : dataIBC['display'];
        } else {
          amount = TransactionHelper.balanceOf(
            Number(amountTemp) || 0,
            coinInfo.coinDecimals,
          );
        }
        listTx.push({
          tx_hash: tx.hash,
          from: fromAddress,
          to: toAddress,
          amount,
          image,
          denom,
        });
      });
    });

    return listTx;
  }

  private async sendNotification(notification: Notification) {
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
}
