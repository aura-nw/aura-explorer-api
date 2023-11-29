import { Injectable } from '@nestjs/common';

import { lastValueFrom } from 'rxjs';
import * as appConfig from '../../../../shared/configs/configuration';

import { HttpService } from '@nestjs/axios';
import { PrivateNameTag } from '../../../../shared/entities/private-name-tag.entity';
import { PublicNameTag } from '../../../../shared/entities/public-name-tag.entity';
import { NotificationDto } from '../dtos/notification.dtos';
import { TransactionHelper } from '../../../../shared/helpers/transaction.helper';
import { NOTIFICATION } from '../../../../shared';
import { WatchList } from '../../../../shared/entities/watch-list.entity';
import { TRANSACTION_TYPE_ENUM } from '../../../../shared/constants/transaction';

@Injectable()
export class NotificationUtil {
  private config;
  constructor(private httpService: HttpService) {
    this.config = appConfig.default();
  }

  async processExecutedNotification(
    response,
    watchList: WatchList[],
    listPrivateNameTag: PrivateNameTag[],
    listPublicNameTag: PublicNameTag[],
  ) {
    const lstNotification: NotificationDto[] = [];
    response?.forEach((tx) => {
      watchList?.forEach(async (element) => {
        const findAddressNotify = tx.transaction_messages?.find(
          (msg) => msg.sender === element.address,
        );
        if (findAddressNotify) {
          const type = TransactionHelper.getTypeTxMsg(tx.transaction_messages);
          const nameTagPhase = await this.getNameTag(
            element.address,
            element.user.id,
            listPrivateNameTag,
            listPublicNameTag,
          );
          const notification = new NotificationDto();
          notification.title = NOTIFICATION.TITLE.EXECUTED;
          notification.user_id = element.user.id;
          notification.tx_hash = tx.hash;
          notification.height = tx.height;
          notification.type = NOTIFICATION.TYPE.EXECUTED;
          notification.body = {
            content: `New ${type} transaction initiated by ${element.address} ${nameTagPhase}`,
            data: {
              type: type,
              sender: element.address,
              nameTag: nameTagPhase,
            },
          };
          lstNotification.push(notification);
        }
      });
    });
    return lstNotification;
  }

  async processCoinTransferNotification(
    data,
    watchList: WatchList[],
    listPrivateNameTag: PrivateNameTag[],
    listPublicNameTag: PublicNameTag[],
  ) {
    const lstNotification: NotificationDto[] = [];
    data?.forEach((tx) => {
      // Filter amount, symbol pair number more than 3 display the first 3 pairs
      const listTransfer = tx.activities
        ?.slice(0, 3)
        ?.map((item) => `${item.amount} ${item.denom}`)
        .join(', ');

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

          const notification = new NotificationDto();
          notification.user_id = element.user.id;
          notification.title =
            element.address === tx.to
              ? NOTIFICATION.TITLE.COIN_RECEIVED
              : NOTIFICATION.TITLE.COIN_SENT;
          notification.image = tx.image;
          notification.tx_hash = tx.tx_hash;
          notification.type = NOTIFICATION.TYPE.COIN_TRANSFER;
          notification.height = tx.activities[0]?.height;
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
      });
    });
    return lstNotification;
  }

  async processTokenTransferNotification(
    data,
    watchList: WatchList[],
    listPrivateNameTag: PrivateNameTag[],
    listPublicNameTag: PublicNameTag[],
  ) {
    const lstNotification: NotificationDto[] = [];
    data?.forEach((tx) => {
      // Filter amount, symbol pair number more than 3 display the first 3 pairs
      const listTokenId = tx.activities
        ?.slice(0, 3)
        ?.map(
          (item) =>
            `${TransactionHelper.balanceOf(
              Number(item.amount) || 0,
              item.cw20_contract.decimal || 6,
            )} ${item.cw20_contract.symbol}`,
        )
        .join(', ');

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

        const notification = new NotificationDto();
        notification.user_id = element.user.id;
        notification.type = NOTIFICATION.TYPE.TOKEN_TRANSFER;
        notification.title =
          element.address === tx.to
            ? NOTIFICATION.TITLE.TOKEN_RECEIVED
            : NOTIFICATION.TITLE.TOKEN_SENT;
        notification.image =
          tx.activities[0].cw20_contract?.marketing_info?.logo?.url;
        notification.height = tx.activities[0]?.height;
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
      });
    });

    return lstNotification;
  }

  async processNftTransferNotification(
    data,
    watchList: WatchList[],
    listPrivateNameTag: PrivateNameTag[],
    listPublicNameTag: PublicNameTag[],
  ) {
    const lstNotification: NotificationDto[] = [];
    data?.forEach((tx) => {
      // Filter NFT more than 2 display the first 2 NFT
      const listTokenId = tx.activities
        ?.slice(0, 2)
        ?.map((item) => item.cw721_token.token_id)
        .join(', ');

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

        const notification = new NotificationDto();
        notification.user_id = element.user.id;
        notification.title =
          element.address === tx.to
            ? NOTIFICATION.TITLE.NFT_RECEIVED
            : NOTIFICATION.TITLE.NFT_SENT;
        const media = tx.activities[0].cw721_token?.media_info?.offchain;
        notification.image = JSON.stringify({
          image: media?.image?.url || media?.animation?.url,
          type: media?.image?.content_type || media?.animation?.content_type,
        });
        notification.tx_hash = tx.tx_hash;
        notification.height = tx.activities[0]?.height;
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
      });
    });
    return lstNotification;
  }

  getTxNotifySent(notifications) {
    return Array.from(
      new Set(
        notifications
          ?.filter((item) => !!item.from)
          .map((s) => {
            return JSON.stringify({ tx_hash: s.tx_hash, from: s.from });
          }),
      ),
    ).map((item: string) => {
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
        notifications
          ?.filter((item) => !!item.to)
          .map((s) => {
            return JSON.stringify({ tx_hash: s.tx_hash, to: s.to });
          }),
      ),
    ).map((item: string) => {
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

    const coinConfig = envConfig?.chainConfig?.coins;
    const coinInfo = envConfig?.chainConfig?.chain_info?.currencies[0];
    const listTx = [];
    data?.forEach((tx) => {
      tx.coin_transfers?.forEach((coin) => {
        const dataIBC = coinConfig.find((k) => k.denom === coin.denom) || {};
        const denom =
          dataIBC['display']?.indexOf('ibc') === -1
            ? 'ibc/' + dataIBC['display']
            : dataIBC['display'];

        listTx.push({
          tx_hash: tx.hash,
          height: tx.height,
          tx_msg:
            tx.transaction_messages?.length > 0
              ? tx.transaction_messages[0]
              : null,
          from: coin.from,
          to: coin.to,
          amount: coin.amount,
          image: dataIBC['logo'] || '',
          denom: denom || coinInfo.coinDenom,
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
