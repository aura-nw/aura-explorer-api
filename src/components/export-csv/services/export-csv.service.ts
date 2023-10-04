import { Injectable } from '@nestjs/common';
import * as appConfig from '../../../shared/configs/configuration';
import { ServiceUtil } from '../../../shared/utils/service.util';
import { AkcLogger, INDEXER_API_V2, RequestContext } from '../../../shared';
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

    let graphqlQuery;
    let dataExport = [];
    let fileName;
    let fields;

    switch (payload.dataType) {
      case TYPE_EXPORT.ExecutedTxs:
        fileName = `export-account-executed-${payload.address}.csv`;
        graphqlQuery = {
          query: INDEXER_API_V2.GRAPH_QL.TX_EXECUTED,
          variables: {
            limit: 1000,
            compositeKey: 'message.sender',
            address: payload.address,
            heightLT:
              payload.dataRangeType === RANGE_EXPORT.Height
                ? +payload.max + 1
                : null,
            heightGT:
              payload.dataRangeType === RANGE_EXPORT.Height
                ? +payload.min - 1
                : null,
            startTime:
              payload.dataRangeType === RANGE_EXPORT.Date ? payload.min : null,
            endTime:
              payload.dataRangeType === RANGE_EXPORT.Date ? payload.max : null,
          },
          operationName: INDEXER_API_V2.OPERATION_NAME.TX_EXECUTED,
        };
        break;
      case TYPE_EXPORT.AuraTxs:
        fileName = `export-account-coin-transfer-${payload.address}.csv`;
        graphqlQuery = {
          query: INDEXER_API_V2.GRAPH_QL.TX_COIN_TRANSFER,
          variables: {
            limit: 1000,
            compositeKeyIn: ['transfer.sender', 'transfer.recipient'],
            address: payload.address,
            heightLT:
              payload.dataRangeType === RANGE_EXPORT.Height
                ? +payload.max + 1
                : null,
            heightGT:
              payload.dataRangeType === RANGE_EXPORT.Height
                ? +payload.min - 1
                : null,
            startTime:
              payload.dataRangeType === RANGE_EXPORT.Date ? payload.min : null,
            endTime:
              payload.dataRangeType === RANGE_EXPORT.Date ? payload.max : null,
          },
          operationName: INDEXER_API_V2.OPERATION_NAME.TX_COIN_TRANSFER,
        };
        break;
      case TYPE_EXPORT.FtsTxs:
        fileName = `export-account-token-transfer-${payload.address}.csv`;
        graphqlQuery = {
          query: INDEXER_API_V2.GRAPH_QL.TX_TOKEN_TRANSFER,
          variables: {
            limit: 1000,
            receiver: payload.address,
            sender: payload.address,
            heightLT:
              payload.dataRangeType === RANGE_EXPORT.Height
                ? +payload.max + 1
                : null,
            heightGT:
              payload.dataRangeType === RANGE_EXPORT.Height
                ? +payload.min - 1
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
        break;
      case TYPE_EXPORT.NftTxs:
        fileName = `export-account-nft-transfer-${payload.address}.csv`;
        graphqlQuery = {
          query: INDEXER_API_V2.GRAPH_QL.TX_NFT_TRANSFER,
          variables: {
            limit: 1000,
            receiver: payload.address,
            sender: payload.address,
            heightLT:
              payload.dataRangeType === RANGE_EXPORT.Height
                ? +payload.max + 1
                : null,
            heightGT:
              payload.dataRangeType === RANGE_EXPORT.Height
                ? +payload.min - 1
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
        break;
      default:
        break;
    }

    const data = (await this.serviceUtil.fetchDataFromGraphQL(graphqlQuery))
      ?.data[this.chainDB];

    const envConfig = await lastValueFrom(
      this.httpService.get(this.config.configUrl),
    ).then((rs) => rs.data);

    const txs = TransactionHelper.convertDataAccountTransaction(
      data,
      envConfig.chain_info.currencies[0],
      payload.dataType,
      payload.address,
      envConfig.coins,
    );

    let lstPrivateName;
    if (userId) {
      const { result } = await this.privateNameTagRepository.getNameTags(
        userId,
        null,
        null,
        500,
        0,
      );
      lstPrivateName = await Promise.all(
        result.map(async (item) => {
          item.nameTag = await this.encryptionService.decrypt(item.nameTag);
          return item;
        }),
      );
    }

    switch (payload.dataType) {
      case TYPE_EXPORT.ExecutedTxs:
        fields = [
          'TxHash',
          'MessageRaw',
          'Message',
          'Result',
          'Timestamp',
          'UnixTimestamp',
          'Fee',
          'BlockHeight',
        ];
        dataExport = txs?.map((tx) => {
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
        break;
      case TYPE_EXPORT.AuraTxs:
        fields = [
          'TxHash',
          'MessageRaw',
          'Message',
          'Timestamp',
          'UnixTimestamp',
          'FromAddress',
          'FromAddressPrivateNameTag',
          'ToAddress',
          'ToAddressPrivateNameTag',
          'AmountIn',
          'AmountOut',
          'Symbol',
          'Denom',
        ];
        txs?.forEach((tx) => {
          tx.arrEvent.forEach((evt) => {
            dataExport.push({
              TxHash: tx.tx_hash,
              MessageRaw: tx.lstTypeTemp?.map((item) => item.type)?.toString(),
              Message: tx.lstType,
              Timestamp: tx.timestamp,
              UnixTimestamp: Math.floor(
                new Date(tx.timestamp).getTime() / 1000,
              ),
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
        break;
      case TYPE_EXPORT.FtsTxs:
        fields = [
          'TxHash',
          'MessageRaw',
          'Message',
          'Timestamp',
          'UnixTimestamp',
          'FromAddress',
          'FromAddressPrivateNameTag',
          'ToAddress',
          'ToAddressPrivateNameTag',
          'AmountIn',
          'AmountOut',
          'Symbol',
          'TokenContractAddress',
        ];
        txs?.forEach((tx) => {
          tx.arrEvent.forEach((evt) => {
            dataExport.push({
              TxHash: tx.tx_hash,
              MessageRaw: tx.lstTypeTemp?.map((item) => item.type)?.toString(),
              Message: tx.lstType,
              Timestamp: tx.timestamp,
              UnixTimestamp: Math.floor(
                new Date(tx.timestamp).getTime() / 1000,
              ),
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
        break;
      case TYPE_EXPORT.NftTxs:
        fields = [
          'TxHash',
          'MessageRaw',
          'Message',
          'Timestamp',
          'UnixTimestamp',
          'FromAddress',
          'FromAddressPrivateNameTag',
          'ToAddress',
          'ToAddressPrivateNameTag',
          'TokenIdIn',
          'TokenIdOut',
          'NFTContractAddress',
        ];
        txs?.forEach((tx) => {
          tx.arrEvent.forEach((evt) => {
            dataExport.push({
              TxHash: tx.tx_hash,
              MessageRaw: tx.lstTypeTemp?.map((item) => item.type)?.toString(),
              Message: tx.lstType,
              Timestamp: tx.timestamp,
              UnixTimestamp: Math.floor(
                new Date(tx.timestamp).getTime() / 1000,
              ),
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
        break;
      default:
        break;
    }
    return { data: dataExport, fileName, fields };
  }
}
