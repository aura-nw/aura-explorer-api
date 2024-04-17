import * as _ from 'lodash';
import {
  CodeTransaction,
  NULL_ADDRESS,
  StatusTransaction,
  TRANSACTION_TYPE_ENUM,
  TYPE_TRANSACTION,
  TYPE_EXPORT,
  TypeTransaction,
  EvmMethod,
} from '../constants/transaction';
import BigNumber from 'bignumber.js';
import { Explorer } from '../entities/explorer.entity';
import { toHex, fromBase64 } from '@cosmjs/encoding';
import { ASSETS_TYPE } from '../constants';
import { id as keccak256Str } from 'ethers';

export class TransactionHelper {
  static convertDataAccountTransaction(
    data,
    coinInfo: Explorer,
    modeQuery,
    currentAddress,
    coinConfig = null,
  ) {
    const txs = _.get(data, 'transaction')?.map((element) => {
      const code = _.get(element, 'code');
      const tx_hash = _.get(element, 'hash') || _.get(element, 'tx.hash');
      const lstTypeTemp =
        _.get(element, 'transaction_messages') ||
        _.get(element, 'tx.transaction_messages');
      let type;
      if (lstTypeTemp) {
        if (lstTypeTemp[0]['type'] === TRANSACTION_TYPE_ENUM.GetReward) {
          type = TypeTransaction.GetReward;
        } else if (lstTypeTemp?.length > 1) {
          if (lstTypeTemp[0]['type'] === TRANSACTION_TYPE_ENUM.MultiSend) {
            type = TypeTransaction.MultiSend;
          } else {
            type = 'Multiple';
          }
        }
      }
      const lstType = this.getTypeTxMsg(lstTypeTemp);

      let denom = coinInfo.minimalDenom;
      const _amount = _.get(element, 'events[0].event_attributes[2].value');
      const value = _amount?.match(/\d+/g);
      let amount = this.balanceOf(value?.length > 0 ? value[0] : 0);

      const status =
        _.get(element, 'code') == CodeTransaction.Success
          ? StatusTransaction.Success
          : StatusTransaction.Fail;

      const decimal =
        _.get(element, 'fee[0].denom') === coinInfo.evmDenom
          ? coinInfo.evmDecimal
          : coinInfo.decimal;

      const fee = this.balanceOf(_.get(element, 'fee[0].amount') || 0, decimal);
      const height = _.get(element, 'height');
      const timestamp =
        _.get(element, 'timestamp') || _.get(element, 'tx.timestamp');
      const limit = 5;
      let fromAddress;
      let toAddress;
      let arrEvent;
      let tokenId;
      let contractAddress;
      let action;
      let evmTxHash;

      switch (modeQuery) {
        case TYPE_EXPORT.ExecutedTxs:
          type = this.getTypeTx(element)?.type;
          evmTxHash = element.evm_transaction?.hash || '';
          break;
        case TYPE_EXPORT.AuraTxs:
          const arrTemp = [];
          element.coin_transfers?.forEach((coin) => {
            const asset = coinConfig.find((k) => k.denom === coin.denom) || {};
            // Get denom ibc in config
            let denom = '';
            if (asset?.type === ASSETS_TYPE.IBC) {
              denom =
                asset.symbol?.indexOf('ibc') === -1
                  ? 'ibc/' + asset.symbol
                  : asset.symbol;
            } else {
              denom =
                coin.denom?.indexOf('ibc') === -1 ? asset?.symbol : coin.denom;
            }
            if (!denom) {
              // Set default symbol is natives symbol
              denom = coinConfig.find(
                (k) => k.denom === coinInfo.minimalDenom,
              )?.symbol;
            }

            if (coin.to === currentAddress || coin.from === currentAddress) {
              const { type, action } = this.getTypeTx(element);
              const result = {
                type,
                toAddress: coin.to,
                fromAddress: coin.from,
                amount: this.balanceOf(
                  Number(coin.amount) || 0,
                  asset.decimal || coinInfo.decimal,
                ),
                denom,
                action,
                denomOrigin:
                  coin.denom?.indexOf('ibc') === -1
                    ? coinInfo.minimalDenom
                    : coin.denom,
                amountTemp: coin.amount,
                decimal: asset.decimal || coinInfo.decimal,
              };
              arrTemp.push(result);
            }
          });
          arrEvent = arrTemp;
          break;
        case TYPE_EXPORT.FtsTxs:
          const typeAndAction = this.getTypeTx(element.tx);
          const decimal = element.cw20_contract?.decimal;

          arrEvent = [
            {
              type: typeAndAction.type,
              fromAddress: element.from || NULL_ADDRESS,
              toAddress: element.to || NULL_ADDRESS,
              amount: this.balanceOf(element.amount || 0, +decimal),
              denom: element.cw20_contract?.symbol,
              contractAddress: element.cw20_contract?.smart_contract?.address,
              action: typeAndAction.action,
              amountTemp: element.amount,
              decimal,
            },
          ];
          break;
        case TYPE_EXPORT.NftTxs:
          const nftTypeAndAction = this.getTypeTx(element.tx);

          arrEvent = [
            {
              type: nftTypeAndAction.type,
              fromAddress: element.from || NULL_ADDRESS,
              toAddress: element.to || NULL_ADDRESS,
              tokenId: element.cw721_token.token_id,
              contractAddress: element.cw721_contract?.smart_contract?.address,
            },
          ];
          break;
      }

      if (modeQuery !== TYPE_EXPORT.ExecutedTxs) {
        fromAddress = arrEvent[0]?.fromAddress;
        toAddress = arrEvent[0]?.toAddress;
        denom = arrEvent[0]?.denom;
        amount = arrEvent[0]?.amount;
        type = arrEvent[0]?.type || lstTypeTemp[0]?.type?.split('.').pop();
        if (type?.startsWith('Msg')) {
          type = type?.replace('Msg', '');
        }
        tokenId = arrEvent[0]?.tokenId;
        contractAddress = arrEvent[0]?.contractAddress;
        action = arrEvent[0]?.action;
      }

      return {
        code,
        tx_hash,
        evmTxHash,
        type,
        status,
        amount,
        fee,
        height,
        timestamp,
        denom,
        fromAddress,
        toAddress,
        tokenId,
        contractAddress,
        arrEvent,
        limit,
        action,
        lstTypeTemp,
        lstType,
      };
    });
    return txs;
  }

  static balanceOf(amount: string | number, decimal = 6): number {
    return +(new BigNumber(amount).toNumber() / Math.pow(10, decimal)).toFixed(
      decimal,
    );
  }

  static getTypeTx(element) {
    let type = element?.transaction_messages[0]?.content['@type'];
    let action;
    if (type === TRANSACTION_TYPE_ENUM.ExecuteContract) {
      try {
        let dataTemp = _.get(element, 'transaction_messages[0].content.msg');
        if (typeof dataTemp === 'string') {
          try {
            dataTemp = JSON.parse(dataTemp);
          } catch (e) {}
        }
        action = Object.keys(dataTemp)[0];
        type = 'Contract: ' + action;
      } catch (e) {}
    } else {
      type =
        _.find(TYPE_TRANSACTION, { label: type })?.value ||
        type.split('.').pop();
      if (type.startsWith('Msg')) {
        type = type?.replace('Msg', '');
      }
    }
    return { type, action };
  }

  static getTypeTxMsg(value) {
    let result = '';
    value?.forEach((element, index) => {
      const typeMsg = element.type || element['@type'];
      let type;
      if (typeMsg === TRANSACTION_TYPE_ENUM.ExecuteContract) {
        try {
          let dataTemp = _.get(element, 'content.msg') || _.get(element, 'msg');
          if (typeof dataTemp === 'string') {
            try {
              dataTemp = JSON.parse(dataTemp);
            } catch (e) {}
          }
          const action = Object.keys(dataTemp)[0];
          type = 'Contract: ' + action;
        } catch (e) {}
      } else {
        type =
          _.find(TYPE_TRANSACTION, { label: typeMsg })?.value ||
          typeMsg.split('.').pop();
      }

      if (index <= 4) {
        if (result?.length > 0) {
          result += ', ' + type;
        } else {
          result += type;
        }
      }
    });
    if (value?.length > 5) {
      result += ', ...';
    }
    return result;
  }

  static toHexData(data: string) {
    if (!data) {
      return data;
    }
    return `0x${toHex(fromBase64(data))}`.substring(0, 10);
  }

  static getFunctionNameByMethodId(methodId: string, listMethodMapping: any[]) {
    if (!methodId) {
      return EvmMethod.default.name;
    }
    if (methodId === EvmMethod.creation.id) {
      return EvmMethod.creation.name;
    }
    const humanReadableTopic = listMethodMapping?.find(
      (item) => item.function_id === methodId,
    )?.human_readable_topic;
    if (!humanReadableTopic) {
      return methodId;
    }
    const methodTemp = humanReadableTopic?.split(' ')[1];
    const method = methodTemp.substring(0, methodTemp.indexOf('('));
    return method;
  }
}
