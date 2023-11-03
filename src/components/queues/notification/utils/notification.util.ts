import { Injectable } from '@nestjs/common';

import { lastValueFrom } from 'rxjs';
import * as appConfig from '../../../../shared/configs/configuration';

import { HttpService } from '@nestjs/axios';
import { NotificationToken } from '../../../../shared/entities/notification-token.entity';
import { PrivateNameTag } from '../../../../shared/entities/private-name-tag.entity';
import { PublicNameTag } from '../../../../shared/entities/public-name-tag.entity';
import { NotificationDto } from '../dtos/notification.dtos';
import { TransactionHelper } from '../../../../shared/helpers/transaction.helper';
import { NOTIFICATION } from '../../../../shared';
import { WatchList } from 'src/shared/entities/watch-list.entity';
import { TRANSACTION_TYPE_ENUM } from 'src/shared/constants/transaction';

@Injectable()
export class NotificationUtil {
  private config;
  constructor(private httpService: HttpService) {
    this.config = appConfig.default();
  }

  async processExecutedNotification(
    response,
    watchList: WatchList[],
    listNotificationToken: NotificationToken[],
    listPrivateNameTag: PrivateNameTag[],
    listPublicNameTag: PublicNameTag[],
  ) {
    const lstNotification: NotificationDto[] = [];
    response?.forEach((tx) => {
      tx.transaction_messages.forEach((msg) => {
        const listWatch = watchList.filter(
          (item) => item.address === msg.sender,
        );
        listWatch?.forEach(async (element) => {
          const type = TransactionHelper.getTypeTxMsg(tx.transaction_messages);
          const nameTagPhase = await this.getNameTag(
            element.address,
            element.user.id,
            listPrivateNameTag,
            listPublicNameTag,
          );

          const fcmToken = listNotificationToken?.find(
            (item) => item.user.id === element.user.id,
          )?.notification_token;

          if (fcmToken) {
            const notification = new NotificationDto();
            notification.title = NOTIFICATION.TITLE.EXECUTED;
            notification.token = fcmToken;
            notification.user_id = element.user.id;
            notification.tx_hash = tx.hash;
            notification.type = NOTIFICATION.TYPE.EXCEUTED;
            notification.body = {
              content: `New ${type} transaction initiated by ${msg.sender} ${nameTagPhase}`,
              data: {
                type: type,
                sender: msg.sender,
                nameTag: nameTagPhase,
              },
            };
            lstNotification.push(notification);
          }
        });
      });
    });
    return lstNotification;
  }

  async processCoinTransferNotification(
    data,
    watchList: WatchList[],
    listNotificationToken: NotificationToken[],
    listPrivateNameTag: PrivateNameTag[],
    listPublicNameTag: PublicNameTag[],
  ) {
    const lstNotification: NotificationDto[] = [];
    data?.forEach((tx) => {
      const listTransfer = tx.activities
        ?.slice(0, 3)
        ?.map((item) => `${item.amount} ${item.denom}`)
        .join(',');

      const listWatch = watchList.filter(
        (item) => item.address === tx.from || item.address === tx.to,
      );
      listWatch?.forEach(async (element) => {
        // Check is restake transaction
        const isRestakeTx =
          tx?.tx_msg?.type === TRANSACTION_TYPE_ENUM.ExecuteAuthz &&
          tx?.tx_msg?.content?.msgs?.length > 0 &&
          'type_url' in tx?.tx_msg?.content?.msgs[0];

        const unReceivedRestake =
          element.address === tx.to &&
          element.settings['nativeCoinReceived'].inactiveAutoRestake &&
          isRestakeTx;

        const unSentRestake =
          element.address === tx.from &&
          element.settings['nativeCoinSent'].inactiveAutoRestake &&
          isRestakeTx;

        if (!unSentRestake && !unReceivedRestake) {
          const nameTagPhase = await this.getNameTag(
            element.address,
            element.user.id,
            listPrivateNameTag,
            listPublicNameTag,
          );

          const fcmToken = listNotificationToken?.find(
            (item) => item.user.id === element.user.id,
          )?.notification_token;

          if (fcmToken) {
            const notification = new NotificationDto();
            notification.token = fcmToken;
            notification.user_id = element.user.id;
            notification.title =
              element.address === tx.to
                ? NOTIFICATION.TITLE.COIN_RECEIVED
                : NOTIFICATION.TITLE.COIN_SENT;
            notification.image = tx.image;
            notification.tx_hash = tx.tx_hash;
            notification.type = NOTIFICATION.TYPE.COIN_TRANSFER;
            notification.body = {
              content: `${listTransfer} ${
                tx.activities?.length > 3 ? 'and more ' : ''
              }${element.address === tx.to ? 'received' : 'sent'} by ${
                element.address
              }${nameTagPhase}`,
              data: {
                transfer: listTransfer,
                num: tx.activities?.length,
                from: tx.from,
                to: tx.to,
                address: element.address,
                nameTag: nameTagPhase,
              },
            };
            lstNotification.push(notification);
          }
        }
      });
    });
    return lstNotification;
  }

  async processTokenTransferNotification(
    data,
    watchList: WatchList[],
    listNotificationToken: NotificationToken[],
    listPrivateNameTag: PrivateNameTag[],
    listPublicNameTag: PublicNameTag[],
  ) {
    const lstNotification: NotificationDto[] = [];
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
      listWatch?.forEach(async (element) => {
        const nameTagPhase = await this.getNameTag(
          element.address,
          element.user.id,
          listPrivateNameTag,
          listPublicNameTag,
        );

        const fcmToken = listNotificationToken?.find(
          (item) => item.user.id === element.user.id,
        )?.notification_token;

        if (fcmToken) {
          const notification = new NotificationDto();
          notification.token = fcmToken;
          notification.user_id = element.user.id;
          notification.type = NOTIFICATION.TYPE.TOKEN_TRANSFER;
          notification.title =
            element.address === tx.to
              ? NOTIFICATION.TITLE.TOKEN_RECEIVED
              : NOTIFICATION.TITLE.TOKEN_SENT;
          notification.image =
            tx.activities[0].cw20_contract?.marketing_info?.logo;
          notification.tx_hash = tx.tx_hash;
          notification.body = {
            content: `${listTokenId} ${
              tx.activities?.length > 2 ? 'and more ' : ''
            }${element.address === tx.to ? 'received' : 'sent'} by ${
              element.address
            }${nameTagPhase}`,
            data: {
              tokens: listTokenId,
              num: tx.activities?.length,
              from: tx.from,
              to: tx.to,
              address: element.address,
              nameTag: nameTagPhase,
            },
          };
          lstNotification.push(notification);
        }
      });
    });

    return lstNotification;
  }

  async processNftTransferNotification(
    data,
    watchList: WatchList[],
    listNotificationToken: NotificationToken[],
    listPrivateNameTag: PrivateNameTag[],
    listPublicNameTag: PublicNameTag[],
  ) {
    const lstNotification: NotificationDto[] = [];
    data?.forEach((tx) => {
      const listTokenId = tx.activities
        ?.slice(0, 2)
        ?.map((item) => item.cw721_token.token_id)
        .join(',');

      const listWatch = watchList.filter(
        (item) => item.address === tx.from || item.address === tx.to,
      );
      listWatch?.forEach(async (element) => {
        const nameTagPhase = await this.getNameTag(
          element.address,
          element.user.id,
          listPrivateNameTag,
          listPublicNameTag,
        );

        const fcmToken = listNotificationToken?.find(
          (item) => item.user.id === element.user.id,
        )?.notification_token;

        if (fcmToken) {
          const notification = new NotificationDto();
          notification.token = fcmToken;
          notification.user_id = element.user.id;
          notification.title =
            element.address === tx.to
              ? NOTIFICATION.TITLE.NFT_RECEIVED
              : NOTIFICATION.TITLE.NFT_SENT;
          notification.image =
            tx.activities[0].cw721_token?.media_info?.offchain?.image?.url;
          notification.tx_hash = tx.tx_hash;
          notification.type = NOTIFICATION.TYPE.NFT_TRANSFER;
          notification.body = {
            content: `NFT id ${listTokenId} ${
              tx.activities?.length > 2 ? 'and more ' : ''
            }${element.address === tx.to ? 'received' : 'sent'} by ${
              element.address
            }${nameTagPhase}`,
            data: {
              tokens: listTokenId,
              num: tx.activities?.length || 0,
              from: tx.from,
              to: tx.to,
              address: element.address,
              nameTag: nameTagPhase,
            },
          };
          lstNotification.push(notification);
        }
      });
    });
    return lstNotification;
  }

  getTxNotifySent(notifications) {
    return Array.from(
      new Set(
        notifications?.map((s) => {
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
          activities: notifications?.filter((s) => {
            return s.tx_hash === data.tx_hash && s.from === data.from;
          }),
        };
      });
  }

  getTxNotifyReceived(notifications) {
    return Array.from(
      new Set(
        notifications?.map((s) => {
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
          activities: notifications?.filter((s) => {
            return s.tx_hash === data.tx_hash && s.to === data.to;
          }),
        };
      });
  }

  async convertDataCoinTransfer(data) {
    const envConfig = await lastValueFrom(
      this.httpService.get(this.config.configUrl),
    ).then((rs) => rs.data);

    const coinInfo = envConfig?.chainConfig?.chain_info?.currencies[0];
    const coinConfig = envConfig?.chainConfig?.coins;
    const listTx = [];
    data?.forEach((tx) => {
      tx.events.forEach((evt) => {
        const toAddress = evt.event_attributes.find(
          (k) => k.composite_key === 'transfer.recipient',
        )?.value;
        const fromAddress = evt.event_attributes.find(
          (k) => k.composite_key === 'transfer.sender',
        )?.value;

        const arrAmount = evt.event_attributes
          ?.find((k) => k.composite_key === 'transfer.amount')
          ?.value?.split(',');

        arrAmount?.forEach((rawAmount) => {
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
            tx_msg:
              tx.transaction_messages?.length > 0
                ? tx.transaction_messages[0]
                : null,
            from: fromAddress,
            to: toAddress,
            amount,
            image,
            denom,
          });
        });
      });
    });
    return listTx;
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

    return nameTagPhase?.length > 0 ? `(${nameTagPhase.join(' / ')})` : '';
  }
}
