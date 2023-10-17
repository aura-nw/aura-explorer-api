import * as _ from 'lodash';
import {
  CodeTransaction,
  NULL_ADDRESS,
  StatusTransaction,
  TRANSACTION_TYPE_ENUM,
  TYPE_TRANSACTION,
  TYPE_EXPORT,
  TypeTransaction,
} from '../constants/transaction';
import BigNumber from 'bignumber.js';

export class TransactionHelper {
  static convertDataAccountTransaction(
    data,
    coinInfo,
    modeQuery,
    currentAddress,
    coinConfig = null,
  ) {
    const txs = _.get(data, 'transaction')?.map((element) => {
      const code = _.get(element, 'code');
      const tx_hash = _.get(element, 'hash');
      const lstTypeTemp = _.get(element, 'transaction_messages');
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

      let denom = coinInfo.coinDenom;
      const _amount = _.get(element, 'events[0].event_attributes[2].value');
      const value = _amount?.match(/\d+/g);
      let amount = this.balanceOf(value?.length > 0 ? value[0] : 0);

      const status =
        _.get(element, 'code') == CodeTransaction.Success
          ? StatusTransaction.Success
          : StatusTransaction.Fail;

      const fee = this.balanceOf(
        _.get(element, 'fee[0].amount') || 0,
        coinInfo.coinDecimals,
      ).toFixed(coinInfo.coinDecimals);
      const height = _.get(element, 'height');
      const timestamp = _.get(element, 'timestamp');
      const limit = 5;
      let fromAddress;
      let toAddress;
      let arrEvent;
      let tokenId;
      let contractAddress;
      let action;
      let eventAttr;

      switch (modeQuery) {
        case TYPE_EXPORT.ExecutedTxs:
          type = this.getTypeTx(element)?.type;
          break;
        case TYPE_EXPORT.AuraTxs:
          const arrTemp = [];
          element?.events?.forEach((data) => {
            toAddress = data.event_attributes.find(
              (k) => k.composite_key === 'transfer.recipient',
            )?.value;
            fromAddress = data.event_attributes.find(
              (k) => k.composite_key === 'transfer.sender',
            )?.value;
            if (
              toAddress === currentAddress ||
              fromAddress === currentAddress
            ) {
              const { type, action } = this.getTypeTx(element);
              toAddress = data.event_attributes?.find(
                (k) => k.composite_key === 'transfer.recipient',
              )?.value;
              fromAddress = data.event_attributes?.find(
                (k) => k.composite_key === 'transfer.sender',
              )?.value;
              const rawAmount = data.event_attributes?.find(
                (k) => k.composite_key === 'transfer.amount',
              )?.value;
              const amountTemp = rawAmount?.match(/\d+/g)[0];
              let amount;
              let denom = coinInfo.coinDenom;
              let denomOrigin;
              const decimal = coinInfo.coinDecimals;
              if (rawAmount?.indexOf('ibc') > -1) {
                const dataIBC = this.getDataIBC(rawAmount, coinConfig);
                amount = this.balanceOf(
                  Number(amountTemp) || 0,
                  dataIBC['decimal'] || 6,
                );
                denom =
                  dataIBC['display'].indexOf('ibc') === -1
                    ? 'ibc/' + dataIBC['display']
                    : dataIBC['display'];
                denomOrigin = dataIBC['denom'];
              } else {
                amount = this.balanceOf(
                  Number(amountTemp) || 0,
                  coinInfo.coinDecimals,
                );
              }
              const result = {
                type,
                toAddress,
                fromAddress,
                amount,
                denom,
                action,
                denomOrigin,
                amountTemp,
                decimal,
              };
              arrTemp.push(result);
            }
          });
          arrEvent = arrTemp;
          break;
        case TYPE_EXPORT.FtsTxs:
          arrEvent = _.get(element, 'events')?.map((item) => {
            const { type, action } = this.getTypeTx(element);
            const fromAddress =
              _.get(item, 'smart_contract_events[0].cw20_activities[0].from') ||
              NULL_ADDRESS;
            const toAddress =
              _.get(item, 'smart_contract_events[0].cw20_activities[0].to') ||
              NULL_ADDRESS;
            const denom = _.get(
              item,
              'smart_contract_events[0].smart_contract.cw20_contract.symbol',
            );
            const amountTemp = _.get(
              item,
              'smart_contract_events[0].cw20_activities[0].amount',
            );
            const decimal = _.get(
              item,
              'smart_contract_events[0].smart_contract.cw20_contract.decimal',
            );
            const amount = this.balanceOf(amountTemp || 0, +decimal);
            const contractAddress = _.get(
              item,
              'smart_contract_events[0].smart_contract.address',
            );
            return {
              type,
              fromAddress,
              toAddress,
              amount,
              denom,
              contractAddress,
              action,
              amountTemp,
              decimal,
            };
          });
          break;
        case TYPE_EXPORT.NftTxs:
          arrEvent = _.get(element, 'events')?.map((item) => {
            const { type, action } = this.getTypeTx(element);
            const fromAddress =
              _.get(item, 'smart_contract_events[0].cw721_activity.from') ||
              NULL_ADDRESS;
            let toAddress =
              _.get(item, 'smart_contract_events[0].cw721_activity.to') ||
              _.get(
                item,
                'smart_contract_events[0].cw721_activity.cw721_contract.smart_contract.address',
              ) ||
              NULL_ADDRESS;
            if (action === 'burn') {
              toAddress = NULL_ADDRESS;
            }

            const contractAddress = _.get(
              item,
              'smart_contract_events[0].cw721_activity.cw721_contract.smart_contract.address',
            );
            const tokenId = _.get(
              item,
              'smart_contract_events[0].cw721_activity.cw721_token.token_id',
            );
            const eventAttr = element.event_attribute_index;
            return {
              type,
              fromAddress,
              toAddress,
              tokenId,
              contractAddress,
              eventAttr,
            };
          });
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
        eventAttr = arrEvent[0]?.eventAttr;
      }

      return {
        code,
        tx_hash,
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
        eventAttr,
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

  static getDataIBC(value, coinConfig) {
    let result = {};
    let temp;
    if (value.indexOf('ibc') >= 0) {
      try {
        if (!value.startsWith('ibc')) {
          const temp = value?.match(/\d+/g)[0];
          value = value?.replace(temp, '');
        }
      } catch {}
      result = { display: value, decimals: 6 };
      temp = value.slice(value.indexOf('ibc'));
      result = coinConfig.find((k) => k.denom === temp) || {};
      result['display'] = result['display'] || value;
    } else {
      result = { display: temp, decimals: 6 };
    }
    result['denom'] = result['denom'] || temp;
    return result;
  }
}
