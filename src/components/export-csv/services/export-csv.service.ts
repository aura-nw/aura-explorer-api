import { Injectable } from '@nestjs/common';
import * as appConfig from '../../../shared/configs/configuration';
import { ServiceUtil } from '../../../shared/utils/service.util';
import {
  AkcLogger,
  EXPORT_LIMIT_RECORD,
  INDEXER_API_V2,
  LIMIT_PRIVATE_NAME_TAG,
  RequestContext,
  TX_HEADER,
} from '../../../shared';
import { TransactionHelper } from '../../../shared/helpers/transaction.helper';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import {
  RANGE_EXPORT,
  TYPE_EXPORT,
} from '../../../shared/constants/transaction';
import { ExportCsvParamDto } from '../dtos/export-csv-param.dto';
import { PrivateNameTagRepository } from '../../private-name-tag/repositories/private-name-tag.repository';
import { EncryptionService } from '../../encryption/encryption.service';

@Injectable()
export class ExportCsvService {
  private config;
  private chainDB: string;

  constructor(
    private serviceUtil: ServiceUtil,
    private readonly logger: AkcLogger,
    private httpService: HttpService,
    private privateNameTagRepository: PrivateNameTagRepository,
    private encryptionService: EncryptionService,
  ) {
    this.logger.setContext(ExportCsvService.name);
    this.config = appConfig.default();
    this.chainDB = this.config.indexerV2.chainDB;
  }

  async exportTransactionDataToCSV(
    ctx: RequestContext,
    payload: ExportCsvParamDto,
    userId = null,
  ) {
    this.logger.log(ctx, `${this.exportTransactionDataToCSV.name} was called!`);

    switch (payload.dataType) {
      case TYPE_EXPORT.ExecutedTxs:
        return this.executed(payload);
      case TYPE_EXPORT.AuraTxs:
        return this.coinTransfer(payload, userId);
      case TYPE_EXPORT.FtsTxs:
        return this.tokenTransfer(payload, userId);
      case TYPE_EXPORT.NftTxs:
        return this.nftTransfer(payload, userId);
      default:
        break;
    }
  }

  private async executed(payload: ExportCsvParamDto) {
    const fileName = `export-account-executed-${payload.address}.csv`;
    const graphqlQuery = {
      query: INDEXER_API_V2.GRAPH_QL.TX_EXECUTED,
      variables: {
        limit: 100,
        address: payload.address,
        heightLT:
          payload.dataRangeType === RANGE_EXPORT.Height
            ? +payload.max + 1
            : null,
        heightGT:
          payload.dataRangeType === RANGE_EXPORT.Height
            ? +payload.min > 1
              ? +payload.min - 1
              : 0
            : null,
        startTime:
          payload.dataRangeType === RANGE_EXPORT.Date ? payload.min : null,
        endTime:
          payload.dataRangeType === RANGE_EXPORT.Date ? payload.max : null,
      },
      operationName: INDEXER_API_V2.OPERATION_NAME.TX_EXECUTED,
    };

    const response = await this.queryData(graphqlQuery);

    const envConfig = await lastValueFrom(
      this.httpService.get(this.config.configUrl),
    ).then((rs) => rs.data);

    const txs = TransactionHelper.convertDataAccountTransaction(
      response,
      envConfig.chain_info.currencies[0],
      payload.dataType,
      payload.address,
      envConfig.coins,
    );

    const fields = TX_HEADER.EXECUTED;
    const data = txs?.map((tx) => {
      return {
        TxHash: tx.tx_hash,
        MessageRaw: tx.lstTypeTemp?.map((item) => item.type)?.toString(),
        Message: tx.lstType,
        Result: tx.status,
        Timestamp: tx.timestamp,
        UnixTimestamp: Math.floor(new Date(tx.timestamp).getTime() / 1000),
        Fee: tx.fee,
        BlockHeight: tx.height,
      };
    });

    return { data, fileName, fields };
  }

  private async coinTransfer(payload: ExportCsvParamDto, userId) {
    const fileName = `export-account-coin-transfer-${payload.address}.csv`;
    const graphqlQuery = {
      query: INDEXER_API_V2.GRAPH_QL.TX_COIN_TRANSFER,
      variables: {
        limit: 100,
        compositeKeyIn: ['transfer.sender', 'transfer.recipient'],
        address: payload.address,
        heightLT:
          payload.dataRangeType === RANGE_EXPORT.Height
            ? +payload.max + 1
            : null,
        heightGT:
          payload.dataRangeType === RANGE_EXPORT.Height
            ? +payload.min > 1
              ? +payload.min - 1
              : 0
            : null,
        startTime:
          payload.dataRangeType === RANGE_EXPORT.Date ? payload.min : null,
        endTime:
          payload.dataRangeType === RANGE_EXPORT.Date ? payload.max : null,
      },
      operationName: INDEXER_API_V2.OPERATION_NAME.TX_COIN_TRANSFER,
    };

    const response = await this.queryData(graphqlQuery);

    const envConfig = await lastValueFrom(
      this.httpService.get(this.config.configUrl),
    ).then((rs) => rs.data);

    const txs = TransactionHelper.convertDataAccountTransaction(
      response,
      envConfig.chain_info.currencies[0],
      payload.dataType,
      payload.address,
      envConfig.coins,
    );

    let lstPrivateName;
    let fields = TX_HEADER.COIN_TRANSFER;
    if (userId) {
      fields = TX_HEADER.COIN_TRANSFER_NAMETAG;
      const { result } = await this.privateNameTagRepository.getNameTags(
        userId,
        null,
        null,
        LIMIT_PRIVATE_NAME_TAG,
        0,
      );
      lstPrivateName = await Promise.all(
        result.map(async (item) => {
          item.nameTag = await this.encryptionService.decrypt(item.nameTag);
          return item;
        }),
      );
    }
    const data = [];
    txs?.forEach((tx) => {
      tx.arrEvent.forEach((evt) => {
        data.push({
          TxHash: tx.tx_hash,
          MessageRaw: tx.lstTypeTemp?.map((item) => item.type)?.toString(),
          Message: tx.lstType,
          Timestamp: tx.timestamp,
          UnixTimestamp: Math.floor(new Date(tx.timestamp).getTime() / 1000),
          FromAddress: evt.fromAddress,
          FromAddressPrivateNameTag:
            lstPrivateName?.find((item) => item.address === evt.fromAddress)
              ?.nameTag || '',
          ToAddress: evt.toAddress,
          ToAddressPrivateNameTag:
            lstPrivateName?.find((item) => item.address === evt.toAddress)
              ?.nameTag || '',
          AmountIn: evt.toAddress === payload.address ? evt.amount : '',
          AmountOut: evt.toAddress !== payload.address ? evt.amount : '',
          Symbol: evt.denom,
          Denom: evt.denomOrigin || '',
        });
      });
    });

    return { data, fileName, fields };
  }

  private async tokenTransfer(payload: ExportCsvParamDto, userId) {
    const fileName = `export-account-token-transfer-${payload.address}.csv`;
    const graphqlQuery = {
      query: INDEXER_API_V2.GRAPH_QL.TX_TOKEN_TRANSFER,
      variables: {
        limit: 100,
        receiver: payload.address,
        sender: payload.address,
        heightLT:
          payload.dataRangeType === RANGE_EXPORT.Height
            ? +payload.max + 1
            : null,
        heightGT:
          payload.dataRangeType === RANGE_EXPORT.Height
            ? +payload.min > 1
              ? +payload.min - 1
              : 0
            : null,
        startTime:
          payload.dataRangeType === RANGE_EXPORT.Date ? payload.min : null,
        endTime:
          payload.dataRangeType === RANGE_EXPORT.Date ? payload.max : null,
        actionIn: [
          'mint',
          'burn',
          'transfer',
          'send',
          'transfer_from',
          'burn_from',
          'send_from',
        ],
      },
      operationName: INDEXER_API_V2.OPERATION_NAME.TX_TOKEN_TRANSFER,
    };

    const response = await this.queryData(graphqlQuery);

    const envConfig = await lastValueFrom(
      this.httpService.get(this.config.configUrl),
    ).then((rs) => rs.data);

    const txs = TransactionHelper.convertDataAccountTransaction(
      response,
      envConfig.chain_info.currencies[0],
      payload.dataType,
      payload.address,
      envConfig.coins,
    );

    let lstPrivateName;
    let fields = TX_HEADER.TOKEN_TRANSFER;
    if (userId) {
      fields = TX_HEADER.TOKEN_TRANSFER_NAMETAG;
      const { result } = await this.privateNameTagRepository.getNameTags(
        userId,
        null,
        null,
        LIMIT_PRIVATE_NAME_TAG,
        0,
      );
      lstPrivateName = await Promise.all(
        result.map(async (item) => {
          item.nameTag = await this.encryptionService.decrypt(item.nameTag);
          return item;
        }),
      );
    }
    const data = [];
    txs?.forEach((tx) => {
      tx.arrEvent.forEach((evt) => {
        data.push({
          TxHash: tx.tx_hash,
          MessageRaw: tx.lstTypeTemp?.map((item) => item.type)?.toString(),
          Message: tx.lstType,
          Timestamp: tx.timestamp,
          UnixTimestamp: Math.floor(new Date(tx.timestamp).getTime() / 1000),
          FromAddress: evt.fromAddress,
          FromAddressPrivateNameTag:
            lstPrivateName?.find((item) => item.address === evt.fromAddress)
              ?.nameTag || '',
          ToAddress: evt.toAddress,
          ToAddressPrivateNameTag:
            lstPrivateName?.find((item) => item.address === evt.toAddress)
              ?.nameTag || '',
          AmountIn: evt.toAddress === payload.address ? evt.amount : '',
          AmountOut: evt.toAddress !== payload.address ? evt.amount : '',
          Symbol: evt.denom,
          TokenContractAddress: tx.contractAddress,
        });
      });
    });

    return { data, fileName, fields };
  }

  private async nftTransfer(payload: ExportCsvParamDto, userId) {
    const fileName = `export-account-nft-transfer-${payload.address}.csv`;
    const graphqlQuery = {
      query: INDEXER_API_V2.GRAPH_QL.TX_NFT_TRANSFER,
      variables: {
        limit: 100,
        receiver: payload.address,
        sender: payload.address,
        heightLT:
          payload.dataRangeType === RANGE_EXPORT.Height
            ? +payload.max + 1
            : null,
        heightGT:
          payload.dataRangeType === RANGE_EXPORT.Height
            ? +payload.min > 1
              ? +payload.min - 1
              : 0
            : null,
        startTime:
          payload.dataRangeType === RANGE_EXPORT.Date ? payload.min : null,
        endTime:
          payload.dataRangeType === RANGE_EXPORT.Date ? payload.max : null,
        actionIn: ['mint', 'burn', 'transfer_nft', 'send_nft'],
        neqCw4973: 'crates.io:cw4973',
      },
      operationName: INDEXER_API_V2.OPERATION_NAME.TX_NFT_TRANSFER,
    };

    const response = await this.queryData(graphqlQuery);

    const envConfig = await lastValueFrom(
      this.httpService.get(this.config.configUrl),
    ).then((rs) => rs.data);

    const txs = TransactionHelper.convertDataAccountTransaction(
      response,
      envConfig.chain_info.currencies[0],
      payload.dataType,
      payload.address,
      envConfig.coins,
    );

    let lstPrivateName;
    let fields = TX_HEADER.NFT_TRANSFER;
    if (userId) {
      fields = TX_HEADER.NFT_TRANSFER_NAMETAG;
      const { result } = await this.privateNameTagRepository.getNameTags(
        userId,
        null,
        null,
        LIMIT_PRIVATE_NAME_TAG,
        0,
      );
      lstPrivateName = await Promise.all(
        result.map(async (item) => {
          item.nameTag = await this.encryptionService.decrypt(item.nameTag);
          return item;
        }),
      );
    }
    const data = [];
    txs?.forEach((tx) => {
      tx.arrEvent.forEach((evt) => {
        data.push({
          TxHash: tx.tx_hash,
          MessageRaw: tx.lstTypeTemp?.map((item) => item.type)?.toString(),
          Message: tx.lstType,
          Timestamp: tx.timestamp,
          UnixTimestamp: Math.floor(new Date(tx.timestamp).getTime() / 1000),
          FromAddress: evt.fromAddress,
          FromAddressPrivateNameTag:
            lstPrivateName?.find((item) => item.address === evt.fromAddress)
              ?.nameTag || '',
          ToAddress: evt.toAddress,
          ToAddressPrivateNameTag:
            lstPrivateName?.find((item) => item.address === evt.toAddress)
              ?.nameTag || '',
          TokenIdIn: evt.toAddress === payload.address ? evt.tokenId : '',
          TokenIdOut: evt.toAddress !== payload.address ? evt.tokenId : '',
          NFTContractAddress: evt.contractAddress,
        });
      });
    });

    return { data, fileName, fields };
  }

  private async queryData(graphqlQuery) {
    const result = { transaction: [] };
    let next = true;
    let timesLoop = 0;
    const MAX_LOOP = 10;
    while (
      next &&
      result.transaction?.length < EXPORT_LIMIT_RECORD &&
      timesLoop <= MAX_LOOP
    ) {
      const response = (
        await this.serviceUtil.fetchDataFromGraphQL(graphqlQuery)
      )?.data[this.chainDB];
      if (response?.transaction.length < 100) {
        next = false;
      } else {
        graphqlQuery.variables.heightLT =
          response?.transaction[response.transaction.length - 1]?.height;
      }
      result.transaction?.push(...response?.transaction);
      timesLoop++;
    }

    return result;
  }
}
