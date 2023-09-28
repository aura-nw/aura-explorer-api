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

@Injectable()
export class ExportCsvService {
  private config;
  private chainDB: string;

  constructor(
    private serviceUtil: ServiceUtil,
    private readonly logger: AkcLogger,
    private httpService: HttpService,
  ) {
    this.logger.setContext(ExportCsvService.name);
    this.config = appConfig.default();
    this.chainDB = this.config.indexerV2.chainDB;
  }

  async exportTransactionDataToCSV(ctx: RequestContext, payload) {
    this.logger.log(ctx, `${this.exportTransactionDataToCSV.name} was called!`);

    let graphqlQuery;

    if (payload.dataType === TYPE_EXPORT.ExecutedTxs) {
      payload.compositeKey = 'message.sender';
      graphqlQuery = {
        query: INDEXER_API_V2.GRAPH_QL.TX_EXECUTED,
        variables: {
          limit: payload.limit || 100,
          compositeKey: 'message.sender',
          address: payload.address,
          heightLT:
            payload.dataRangeType === RANGE_EXPORT.Height ? payload.max : null,
          heightGT:
            payload.dataRangeType === RANGE_EXPORT.Height ? payload.min : null,
          startTime:
            payload.dataRangeType === RANGE_EXPORT.Date ? payload.min : null,
          endTime:
            payload.dataRangeType === RANGE_EXPORT.Date ? payload.max : null,
        },
        operationName: INDEXER_API_V2.OPERATION_NAME.TX_EXECUTED,
      };
    }

    const data = (await this.serviceUtil.fetchDataFromGraphQL(graphqlQuery))
      .data[this.chainDB];

    const envConfig = await lastValueFrom(
      this.httpService.get(this.config.configUrl),
    ).then((rs) => rs.data);

    const txs = TransactionHelper.convertDataAccountTransaction(
      data,
      envConfig.chain_info.currencies[0],
      TYPE_EXPORT.ExecutedTxs,
      payload.address,
      envConfig.coins,
    );
    let dataExport;
    if (payload.dataType === TYPE_EXPORT.ExecutedTxs) {
      dataExport = txs.map((tx) => {
        return {
          TxHash: tx.tx_hash,
          MessageRaw: JSON.stringify(tx.lstTypeTemp),
          Message: tx.type,
          Result: tx.status,
          Timestamp: tx.timestamp,
          UnixTimestamp: tx.timestamp,
          Fee: tx.fee,
          BlockHeight: tx.height,
        };
      });
    }
    return dataExport;
  }
}
