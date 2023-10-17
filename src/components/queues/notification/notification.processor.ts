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
import { Notification, NotificationInfo } from './dtos/notification.dtos';
import { NotificationTokenRepository } from './repositories/notification-token.repository';
import { NotificationToken } from '../../../shared/entities/notification-token.enitity';
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

    const response = (await this.serviceUtil.fetchDataFromGraphQL(graphQlQuery))
      ?.data[this.chainDB];

    const watchList = [
      { address: 'aura1xahhax60fakwfng0sdd6wcxd0eeu00r5w3s49h', userId: 1 },
      { address: 'aura14ce3689drnqwds3xekmw0vqn6mttfhvmgk9k8u', userId: 18 },
    ];

    const privateNameTags = await this.privateNameTagRepository.find();
    const publicNameTags = await this.publicNameTagRepository.find();
    const notificationTokens = await this.notificationTokenRepository.find();

    const notifications = await this.processExecutedNotification(
      response,
      watchList,
      notificationTokens,
      privateNameTags,
      publicNameTags,
    );
  }

  @Process(QUEUES.NOTIFICATION.JOBS.NOTIFICATION_COIN_TRANSFER)
  async notificationCoinTransfer() {
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

    const response = (await this.serviceUtil.fetchDataFromGraphQL(graphQlQuery))
      ?.data[this.chainDB];

    const watchList = [
      { address: 'aura1xahhax60fakwfng0sdd6wcxd0eeu00r5w3s49h', userId: 1 },
      { address: 'aura14ce3689drnqwds3xekmw0vqn6mttfhvmgk9k8u', userId: 18 },
    ];

    const privateNameTags = await this.privateNameTagRepository.find();
    const publicNameTags = await this.publicNameTagRepository.find();
    const notificationTokens = await this.notificationTokenRepository.find();

    const listTx = await this.convertDataCoinTransfer(response?.coin_transfer);

    const notifyToTx = this.getTxNotifyFrom(listTx);
    const coinTransferTo = await this.processCoinTransferNotification(
      notifyToTx,
      watchList,
      notificationTokens,
      privateNameTags,
      publicNameTags,
    );

    const notifyFromTx = this.getTxNotifyFrom(listTx);
    const coinTransferFrom = await this.processCoinTransferNotification(
      notifyFromTx,
      watchList,
      notificationTokens,
      privateNameTags,
      publicNameTags,
    );
    const notifications = [...coinTransferFrom, ...coinTransferTo];
  }

  @Process(QUEUES.NOTIFICATION.JOBS.NOTIFICATION_TOKEN_TRANSFER)
  async notificationTokenTransfer() {
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
        type: SYNC_POINT_TYPE.COIN_TRANSFER_HEIGHT,
        point: data?.total_blocks,
      });
      return;
    }

    const graphQlQuery = {
      query: INDEXER_API_V2.GRAPH_QL.COIN_TRANSFER_NOTIFICATION,
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
      operationName: INDEXER_API_V2.OPERATION_NAME.COIN_TRANSFER_NOTIFICATION,
    };

    const response = (await this.serviceUtil.fetchDataFromGraphQL(graphQlQuery))
      ?.data[this.chainDB];

    const watchList = [
      { address: 'aura1xahhax60fakwfng0sdd6wcxd0eeu00r5w3s49h', userId: 1 },
      { address: 'aura14ce3689drnqwds3xekmw0vqn6mttfhvmgk9k8u', userId: 18 },
    ];

    const privateNameTags = await this.privateNameTagRepository.find();
    const publicNameTags = await this.publicNameTagRepository.find();
    const notificationTokens = await this.notificationTokenRepository.find();

    const notifyFromTx = this.getTxNotifyFrom(response?.token_transfer);
    const nftTransferFrom = await this.processTokenTransferNotification(
      notifyFromTx,
      watchList,
      notificationTokens,
      privateNameTags,
      publicNameTags,
    );

    const notifyToTx = this.getTxNotifyTo(response?.token_transfer);
    const nftTransferTo = await this.processTokenTransferNotification(
      notifyToTx,
      watchList,
      notificationTokens,
      privateNameTags,
      publicNameTags,
    );

    const notifications = [...nftTransferFrom, ...nftTransferTo];
  }

  @Process(QUEUES.NOTIFICATION.JOBS.NOTIFICATION_NFT_TRANSFER)
  async notificationNftTransfer() {
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
      query: INDEXER_API_V2.GRAPH_QL.COIN_TRANSFER_NOTIFICATION,
      variables: {
        heightGT: currentTxHeight.point,
        listFilterCW721: ['mint', 'burn', 'transfer_nft', 'send_nft'],
      },
      operationName: INDEXER_API_V2.OPERATION_NAME.COIN_TRANSFER_NOTIFICATION,
    };

    const response = (await this.serviceUtil.fetchDataFromGraphQL(graphQlQuery))
      ?.data[this.chainDB];

    const watchList = [
      { address: 'aura1xahhax60fakwfng0sdd6wcxd0eeu00r5w3s49h', userId: 1 },
      { address: 'aura14ce3689drnqwds3xekmw0vqn6mttfhvmgk9k8u', userId: 18 },
    ];

    const privateNameTags = await this.privateNameTagRepository.find();
    const publicNameTags = await this.publicNameTagRepository.find();
    const notificationTokens = await this.notificationTokenRepository.find();

    const notifyFromTx = this.getTxNotifyFrom(response?.nft_transfer);
    const nftTransferFrom = await this.processNftTransferNotification(
      notifyFromTx,
      watchList,
      notificationTokens,
      privateNameTags,
      publicNameTags,
    );

    const notifyToTx = this.getTxNotifyTo(response?.nft_transfer);
    const nftTransferTo = await this.processNftTransferNotification(
      notifyToTx,
      watchList,
      notificationTokens,
      privateNameTags,
      publicNameTags,
    );

    const notifications = [...nftTransferFrom, ...nftTransferTo];
  }

  private async getNameTag(
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

    return nameTagPhase.length > 0 ? `(${nameTagPhase.join(' / ')})` : '';
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
            let notification: Notification;
            const type = TransactionHelper.getTypeTxMsg(
              tx.transaction_messages,
            );
            const notificationInfo: NotificationInfo = {
              image: '',
              contentType: '',
              txHash: tx.hash,
              type: 'executed',
            };
            notification.notificationToken = listNotificationToken.find(
              (item) => item.userId === element.userId,
            )?.notification_token;
            notification.notificationInfo = notificationInfo;
            notification.content = `New ${type} transaction initiated by ${
              msg.sender
            } ${this.getNameTag(
              element.address,
              element.userId,
              listPrivateNameTag,
              listPublicNameTag,
            )}`;
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
      const notificationInfo: NotificationInfo = {
        image: tx.image,
        contentType: 'image/png',
        txHash: tx.tx_hash,
        type: 'coin_transfer',
      };
      const listTransfer = tx.activities
        .filter((item, index) => {
          if (index < 3) {
            return `${item.amount} ${item.denom}`;
          }
        })
        ?.join(',');

      tx.activities.forEach((act) => {
        const listWatch = watchList.filter(
          (item) => item.address === act.from || item.address === act.to,
        );
        listWatch?.forEach((element) => {
          let notification: Notification;
          notification.notificationToken = listNotificationToken.find(
            (item) => item.userId === element.userId,
          )?.notification_token;
          const method = element.address === act.to ? 'received' : 'sent';
          notification.notificationInfo = notificationInfo;
          notification.content = `${listTransfer} ${
            tx.activities.length > 3 ? 'and more' : ''
          } ${method} by ${element.address} ${this.getNameTag(
            element.address,
            element.userId,
            listPrivateNameTag,
            listPublicNameTag,
          )}`;
          lstNotification.push(notification);
        });
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
      const notificationInfo: NotificationInfo = {
        image: tx.activities[0].cw20_contract?.marketing_info?.logo,
        contentType: 'image/png',
        txHash: tx.tx_hash,
        type: 'token_transfer',
      };
      const listTokenId = tx.activities
        .filter((item, index) => {
          if (index < 3) {
            return item.cw20_contract.name;
          }
        })
        ?.join(',');

      tx.activities.forEach((act) => {
        const listWatch = watchList.filter(
          (item) => item.address === act.from || item.address === act.to,
        );
        listWatch?.forEach((element) => {
          let notification: Notification;
          notification.notificationToken = listNotificationToken.find(
            (item) => item.userId === element.userId,
          )?.notification_token;
          const method = element.address === act.to ? 'received' : 'sent';
          notification.notificationInfo = notificationInfo;
          notification.content = `${listTokenId} ${
            tx.activities.length > 2 ? 'and more' : ''
          } ${method} by ${element.address} ${this.getNameTag(
            element.address,
            element.userId,
            listPrivateNameTag,
            listPublicNameTag,
          )}`;
          lstNotification.push(notification);
        });
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
      const notificationInfo: NotificationInfo = {
        image: tx.activities[0].cw721_token?.media_info?.offchain?.image?.url,
        contentType:
          tx.activities[0].cw721_token?.media_info?.offchain?.image
            ?.content_type,
        txHash: tx.tx_hash,
        type: 'nft_transfer',
      };
      const listTokenId = tx.activities
        .filter((item, index) => {
          if (index < 2) {
            return item.cw721_token.token_id;
          }
        })
        ?.join(',');

      const listWatch = watchList.filter(
        (item) => item.address === tx.from || item.address === tx.to,
      );
      listWatch?.forEach((element) => {
        let notification: Notification;
        notification.notificationToken = listNotificationToken.find(
          (item) => item.userId === element.userId,
        )?.notification_token;
        const method = element.address === tx.to ? 'received' : 'sent';
        notification.notificationInfo = notificationInfo;
        notification.content = `${listTokenId} ${
          tx.activities.length > 2 ? 'and more' : ''
        } ${method} by ${element.address} ${this.getNameTag(
          element.address,
          element.userId,
          listPrivateNameTag,
          listPublicNameTag,
        )}`;
        lstNotification.push(notification);
      });
    });
    return lstNotification;
  }

  private getTxNotifyFrom(data) {
    return Array.from(
      new Set(
        data?.map((s) => {
          return JSON.stringify({ tx_hash: s.tx_hash, from: s.from });
        }),
      ),
    ).map((item: string) => {
      const data = JSON.parse(item);
      return {
        tx_hash: data.txHash,
        from: data.from,
        to: null,
        activities: data?.filter((s) => {
          return s.tx_hash === data.label && s.from === data.from;
        }),
      };
    });
  }

  private getTxNotifyTo(data) {
    return Array.from(
      new Set(
        data?.map((s) => {
          return JSON.stringify({ tx_hash: s.tx_hash, to: s.to });
        }),
      ),
    ).map((item: string) => {
      const data = JSON.parse(item);
      return {
        tx_hash: data.txHash,
        to: data.to,
        from: null,
        activities: data?.filter((s) => {
          return s.tx_hash === data.label && s.to === data.to;
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

        const rawAmount = tx.event_attributes?.find(
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
}
