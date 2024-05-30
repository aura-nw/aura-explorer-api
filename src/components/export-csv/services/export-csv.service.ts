import { Injectable } from '@nestjs/common';
import * as appConfig from '../../../shared/configs/configuration';
import { ServiceUtil } from '../../../shared/utils/service.util';
import {
  ASSETS_TYPE,
  AkcLogger,
  EXPORT_LIMIT_RECORD,
  INDEXER_API_V2,
  LIMIT_PRIVATE_NAME_TAG,
  QUERY_LIMIT_RECORD,
  RequestContext,
  TX_HEADER,
} from '../../../shared';
import { TransactionHelper } from '../../../shared/helpers/transaction.helper';
import {
  RANGE_EXPORT,
  TYPE_EXPORT,
} from '../../../shared/constants/transaction';
import { ExportCsvParamDto } from '../dtos/export-csv-param.dto';
import { PrivateNameTagRepository } from '../../private-name-tag/repositories/private-name-tag.repository';
import { EncryptionService } from '../../encryption/encryption.service';
import { In, IsNull, Not, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Explorer } from 'src/shared/entities/explorer.entity';
import * as util from 'util';
import { AssetsRepository } from '../../asset/repositories/assets.repository';

@Injectable()
export class ExportCsvService {
  private config;
  private defaultChainDB: string;

  constructor(
    private serviceUtil: ServiceUtil,
    private readonly logger: AkcLogger,
    private privateNameTagRepository: PrivateNameTagRepository,
    private encryptionService: EncryptionService,
    private assetRepository: AssetsRepository,
    @InjectRepository(Explorer)
    private explorerRepository: Repository<Explorer>,
  ) {
    this.logger.setContext(ExportCsvService.name);
    this.config = appConfig.default();
    this.defaultChainDB = this.config.indexerV2.chainDB;
  }

  async exportTransactionDataToCSV(
    ctx: RequestContext,
    payload: ExportCsvParamDto,
    userId = null,
  ) {
    this.logger.log(ctx, `${this.exportTransactionDataToCSV.name} was called!`);
    try {
      const explorer = await this.explorerRepository.findOneOrFail({
        chainId: ctx.chainId,
      });
      switch (payload.dataType) {
        case TYPE_EXPORT.ExecutedTxs:
          return this.executed(payload, explorer);
        case TYPE_EXPORT.AuraTxs:
          return this.coinTransfer(ctx, payload, userId, explorer);
        case TYPE_EXPORT.FtsTxs:
          return this.tokenTransfer(ctx, payload, userId, explorer);
        case TYPE_EXPORT.Cw721Txs:
          return this.cw721Transfer(ctx, payload, userId, explorer);
        case TYPE_EXPORT.Erc721Txs:
          return this.erc721Transfer(ctx, payload, userId, explorer);
        case TYPE_EXPORT.EVMExecutedTxs:
          return this.evmExecuted(payload, userId, explorer);
        case TYPE_EXPORT.Erc20Txs:
          return this.erc20Transfer(ctx, payload, userId, explorer);
        default:
          break;
      }
    } catch (err) {
      this.logger.error(
        ctx,
        `Error export executed ${err.message} ${err.stack}`,
      );
    }
  }

  private async executed(payload: ExportCsvParamDto, explorer: Explorer) {
    const fileName = `export-account-executed-${payload.address}.csv`;
    const graphqlQuery = {
      query: util.format(INDEXER_API_V2.GRAPH_QL.TX_EXECUTED, explorer.chainDb),
      variables: {
        limit: QUERY_LIMIT_RECORD,
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

    const { result: response } = await this.queryData(
      graphqlQuery,
      explorer.chainDb,
    );

    const txs = TransactionHelper.convertDataAccountTransaction(
      response,
      explorer,
      payload.dataType,
      payload.address,
    );

    const fields = TX_HEADER.EXECUTED;
    const data = txs?.map((tx) => {
      return {
        TxHash: tx.tx_hash,
        EvmTxHash: tx.evmTxHash,
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

  private async evmExecuted(
    payload: ExportCsvParamDto,
    userId,
    explorer: Explorer,
  ) {
    const fileName = `export-account-evm-executed-${payload.evmAddress}.csv`;
    const graphqlQuery = {
      query: util.format(
        INDEXER_API_V2.GRAPH_QL.TX_EVM_EXECUTED,
        explorer.chainDb,
      ),
      variables: {
        limit: QUERY_LIMIT_RECORD,
        address: payload.evmAddress,
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
      operationName: INDEXER_API_V2.OPERATION_NAME.TX_EVM_EXECUTED,
    };

    const { result: response, listMethods } = await this.queryData(
      graphqlQuery,
      explorer.chainDb,
      TYPE_EXPORT.EVMExecutedTxs,
    );
    const asset = await this.assetRepository.findOneOrFail({
      denom: explorer.minimalDenom,
    });

    let fields = TX_HEADER.EVM_EXECUTED;
    let lstPrivateName;
    if (userId) {
      fields = TX_HEADER.EVM_EXECUTED_NAMETAG;
      const { result } = await this.privateNameTagRepository.getNameTags(
        userId,
        null,
        null,
        LIMIT_PRIVATE_NAME_TAG,
        0,
        explorer.chainId,
      );
      lstPrivateName = await Promise.all(
        result.map(async (item) => {
          item.evmAddress = item.evm_address;
          item.nameTag = await this.encryptionService.decrypt(item.nameTag);
          return item;
        }),
      );
    }

    const data = response.transaction.map((tx) => {
      return {
        EvmTxHash: tx.hash,
        // Retrieve the function name using the method ID for more accurate CSV data
        Method: TransactionHelper.getFunctionNameByMethodId(
          tx.data?.substring(0, 8),
          listMethods,
        ),
        Height: tx.height,
        Timestamp: tx.transaction?.timestamp,
        UnixTimestamp: Math.floor(
          new Date(tx.transaction?.timestamp).getTime() / 1000,
        ),
        FromAddress: tx.from,
        FromAddressPrivateNameTag:
          lstPrivateName?.find(
            (item) =>
              item.address === tx.from ||
              (item.evmAddress && item.evmAddress === tx.from),
          )?.nameTag || '',
        ToAddress: tx.to,
        ToAddressPrivateNameTag:
          lstPrivateName?.find(
            (item) =>
              item.address === tx.to ||
              (item.evmAddress && item.evmAddress === tx.to),
          )?.nameTag || '',
        Amount: TransactionHelper.balanceOf(
          tx.transaction?.transaction_messages[0].content.data.value,
          explorer.evmDecimal,
        ),
        Symbol: asset.symbol,
        CosmosTxHash: tx.transaction?.hash,
      };
    });

    return { data, fileName, fields };
  }

  private async coinTransfer(
    ctx: RequestContext,
    payload: ExportCsvParamDto,
    userId,
    explorer: Explorer,
  ) {
    const fileName = `export-account-native-transfer-${payload.address}.csv`;
    const graphqlQuery = {
      query: util.format(
        INDEXER_API_V2.GRAPH_QL.TX_COIN_TRANSFER,
        explorer.chainDb,
      ),
      variables: {
        limit: QUERY_LIMIT_RECORD,
        from: payload.address,
        to: payload.address,
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

    const { result: response } = await this.queryData(
      graphqlQuery,
      explorer.chainDb,
    );

    const coinConfig = await this.assetRepository.find({
      where: {
        type: In([ASSETS_TYPE.IBC, ASSETS_TYPE.NATIVE]),
        name: Not(IsNull()),
        explorer: { id: explorer.id },
      },
    });

    const txs = TransactionHelper.convertDataAccountTransaction(
      response,
      explorer,
      payload.dataType,
      payload.address,
      coinConfig,
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
        ctx.chainId,
      );
      lstPrivateName = await Promise.all(
        result.map(async (item) => {
          item.evmAddress = item.evm_address;
          item.nameTag = await this.encryptionService.decrypt(item.nameTag);
          return item;
        }),
      );
    }
    let data = [];
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
            lstPrivateName?.find(
              (item) =>
                item.address === evt.fromAddress ||
                (item.evmAddress && item.evmAddress === evt.fromAddress),
            )?.nameTag || '',
          ToAddress: evt.toAddress,
          ToAddressPrivateNameTag:
            lstPrivateName?.find(
              (item) =>
                item.address === evt.toAddress ||
                (item.evmAddress && item.evmAddress === evt.toAddress),
            )?.nameTag || '',
          AmountIn: evt.toAddress === payload.address ? evt.amount : '',
          AmountOut: evt.toAddress !== payload.address ? evt.amount : '',
          Symbol: evt.denom,
          Denom: evt.denomOrigin || '',
        });
      });
    });

    if (data.length > EXPORT_LIMIT_RECORD) {
      data = data.splice(0, EXPORT_LIMIT_RECORD);
    }

    return { data, fileName, fields };
  }

  private async tokenTransfer(
    ctx: RequestContext,
    payload: ExportCsvParamDto,
    userId,
    explorer: Explorer,
  ) {
    const fileName = `export-account-cw20-transfer-${payload.address}.csv`;
    const graphqlQuery = {
      query: util.format(
        INDEXER_API_V2.GRAPH_QL.TX_TOKEN_TRANSFER,
        explorer.chainDb,
      ),
      variables: {
        limit: QUERY_LIMIT_RECORD,
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

    const { result: response } = await this.queryData(
      graphqlQuery,
      explorer.chainDb,
    );

    const txs = TransactionHelper.convertDataAccountTransaction(
      response,
      explorer,
      payload.dataType,
      payload.address,
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
        ctx.chainId,
      );
      lstPrivateName = await Promise.all(
        result.map(async (item) => {
          item.evmAddress = item.evm_address;
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
            lstPrivateName?.find(
              (item) =>
                item.address === evt.fromAddress ||
                (item.evmAddress && item.evmAddress === evt.fromAddress),
            )?.nameTag || '',
          ToAddress: evt.toAddress,
          ToAddressPrivateNameTag:
            lstPrivateName?.find(
              (item) =>
                item.address === evt.toAddress ||
                (item.evmAddress && item.evmAddress === evt.toAddress),
            )?.nameTag || '',
          AmountIn: evt.toAddress === payload.address ? evt.amount : '',
          AmountOut: evt.toAddress !== payload.address ? evt.amount : '',
          Symbol: evt.denom,
          TokenContractAddress: tx.contractAddress,
        });
      });
    });

    return { data, fileName, fields };
  }

  private async erc20Transfer(
    ctx: RequestContext,
    payload: ExportCsvParamDto,
    userId,
    explorer: Explorer,
  ) {
    const fileName = `export-account-erc20-transfer-${payload.evmAddress}.csv`;
    const graphqlQuery = {
      query: util.format(
        INDEXER_API_V2.GRAPH_QL.TX_ERC20_TRANSFER,
        explorer.chainDb,
      ),
      variables: {
        limit: QUERY_LIMIT_RECORD,
        to: payload.evmAddress,
        from: payload.evmAddress,
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
      operationName: INDEXER_API_V2.OPERATION_NAME.TX_ERC20_TRANSFER,
    };

    const { result: response, listMethods } = await this.queryData(
      graphqlQuery,
      explorer.chainDb,
      TYPE_EXPORT.Erc20Txs,
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
        ctx.chainId,
      );
      lstPrivateName = await Promise.all(
        result.map(async (item) => {
          item.evmAddress = item.evm_address;
          item.nameTag = await this.encryptionService.decrypt(item.nameTag);
          return item;
        }),
      );
    }
    const data = response.transaction?.map((tx) => {
      return {
        TxHash: tx.tx_hash,
        MessageRaw: tx.evm_transaction.transaction_message.type,
        Message: TransactionHelper.getFunctionNameByMethodId(
          tx.evm_transaction.data?.substring(0, 8),
          listMethods,
        ),
        Timestamp: tx.evm_transaction.transaction.timestamp,
        UnixTimestamp: Math.floor(
          new Date(tx.evm_transaction.transaction.timestamp).getTime() / 1000,
        ),
        FromAddress: tx.from,
        FromAddressPrivateNameTag:
          lstPrivateName?.find(
            (item) =>
              item.address === tx.from ||
              (item.evmAddress && item.evmAddress === tx.from),
          )?.nameTag || '',
        ToAddress: tx.to,
        ToAddressPrivateNameTag:
          lstPrivateName?.find(
            (item) =>
              item.address === tx.to ||
              (item.evmAddress && item.evmAddress === tx.to),
          )?.nameTag || '',
        AmountIn:
          tx.to === payload.evmAddress
            ? TransactionHelper.balanceOf(tx.amount, tx.erc20_contract.decimal)
            : '',
        AmountOut:
          tx.to !== payload.evmAddress
            ? TransactionHelper.balanceOf(tx.amount, tx.erc20_contract.decimal)
            : '',
        Symbol: tx.erc20_contract.symbol,
        TokenContractAddress: tx.erc20_contract.address,
      };
    });

    return { data, fileName, fields };
  }

  private async cw721Transfer(
    ctx: RequestContext,
    payload: ExportCsvParamDto,
    userId,
    explorer: Explorer,
  ) {
    const fileName = `export-account-cw721-transfer-${payload.address}.csv`;
    const graphqlQuery = {
      query: util.format(
        INDEXER_API_V2.GRAPH_QL.TX_CW721_TRANSFER,
        explorer.chainDb,
      ),
      variables: {
        limit: QUERY_LIMIT_RECORD,
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
      },
      operationName: INDEXER_API_V2.OPERATION_NAME.TX_CW721_TRANSFER,
    };

    const { result: response } = await this.queryData(
      graphqlQuery,
      explorer.chainDb,
    );

    const txs = TransactionHelper.convertDataAccountTransaction(
      response,
      explorer,
      payload.dataType,
      payload.address,
    );

    let lstPrivateName;
    let fields = TX_HEADER.CW721_TRANSFER;
    if (userId) {
      fields = TX_HEADER.CW721_TRANSFER_NAMETAG;
      const { result } = await this.privateNameTagRepository.getNameTags(
        userId,
        null,
        null,
        LIMIT_PRIVATE_NAME_TAG,
        0,
        ctx.chainId,
      );
      lstPrivateName = await Promise.all(
        result.map(async (item) => {
          item.evmAddress = item.evm_address;
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
            lstPrivateName?.find(
              (item) =>
                item.address === evt.fromAddress ||
                (item.evmAddress && item.evmAddress === evt.fromAddress),
            )?.nameTag || '',
          ToAddress: evt.toAddress,
          ToAddressPrivateNameTag:
            lstPrivateName?.find(
              (item) =>
                item.address === evt.toAddress ||
                (item.evmAddress && item.evmAddress === evt.toAddress),
            )?.nameTag || '',
          TokenIdIn: evt.toAddress === payload.address ? evt.tokenId : '',
          TokenIdOut: evt.toAddress !== payload.address ? evt.tokenId : '',
          Cw721ContractAddress: evt.contractAddress,
          Cw721ContractPrivateNameTag:
            lstPrivateName?.find((item) => item.address === evt.contractAddress)
              ?.nameTag || '',
        });
      });
    });

    return { data, fileName, fields };
  }

  private async erc721Transfer(
    ctx: RequestContext,
    payload: ExportCsvParamDto,
    userId,
    explorer: Explorer,
  ) {
    const fileName = `export-account-erc721-transfer-${payload.evmAddress}.csv`;
    const graphqlQuery = {
      query: util.format(
        INDEXER_API_V2.GRAPH_QL.TX_ERC721_TRANSFER,
        explorer.chainDb,
      ),
      variables: {
        limit: QUERY_LIMIT_RECORD,
        to: payload.evmAddress,
        from: payload.evmAddress,
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
        actionIn: ['transfer'],
      },
      operationName: INDEXER_API_V2.OPERATION_NAME.TX_ERC721_TRANSFER,
    };

    const { result: response, listMethods } = await this.queryData(
      graphqlQuery,
      explorer.chainDb,
      TYPE_EXPORT.Erc721Txs,
    );

    let lstPrivateName;
    let fields = TX_HEADER.ERC721_TRANSFER;
    if (userId) {
      fields = TX_HEADER.ERC721_TRANSFER_NAMETAG;
      const { result } = await this.privateNameTagRepository.getNameTags(
        userId,
        null,
        null,
        LIMIT_PRIVATE_NAME_TAG,
        0,
        ctx.chainId,
      );
      lstPrivateName = await Promise.all(
        result.map(async (item) => {
          item.evmAddress = item.evm_address;
          item.nameTag = await this.encryptionService.decrypt(item.nameTag);
          return item;
        }),
      );
    }
    const data = response.transaction?.map((tx) => {
      const methodId = tx.evm_transaction.data?.substring(0, 8);
      const method = TransactionHelper.getFunctionNameByMethodId(
        methodId,
        listMethods,
      );

      return {
        TxHash: tx.tx_hash,
        MessageRaw: tx.evm_transaction.transaction_message.type,
        Message: method,
        Timestamp: tx.evm_transaction.transaction.timestamp,
        UnixTimestamp: Math.floor(
          new Date(tx.evm_transaction.transaction.timestamp).getTime() / 1000,
        ),
        FromAddress: tx.from,
        FromAddressPrivateNameTag:
          lstPrivateName?.find(
            (item) =>
              item.address === tx.from ||
              (item.evmAddress && item.evmAddress === tx.from),
          )?.nameTag || '',
        ToAddress: tx.to,
        ToAddressPrivateNameTag:
          lstPrivateName?.find(
            (item) =>
              item.address === tx.to ||
              (item.evmAddress && item.evmAddress === tx.to),
          )?.nameTag || '',
        TokenIdIn: tx.to === payload.evmAddress ? tx.erc721_token.token_id : '',
        TokenIdOut:
          tx.to !== payload.evmAddress ? tx.erc721_token.token_id : '',
        Erc721ContractAddress: tx.erc721_contract.address,
      };
    });

    return { data, fileName, fields };
  }

  private async queryData(
    graphqlQuery,
    chainDB = this.defaultChainDB,
    evmExecuted = null,
  ) {
    const result = { transaction: [] };
    const listMethods = [];
    let next = true;
    let timesLoop = 0;
    const MAX_LOOP = 10;
    while (
      next &&
      result.transaction?.length < EXPORT_LIMIT_RECORD &&
      timesLoop < MAX_LOOP
    ) {
      const response = (
        await this.serviceUtil.fetchDataFromGraphQL(graphqlQuery)
      )?.data[chainDB];

      // break loop when horoscope return no data
      if (!response) {
        break;
      }

      if (response?.transaction.length < QUERY_LIMIT_RECORD) {
        next = false;
      } else {
        graphqlQuery.variables.heightLT =
          response?.transaction[response.transaction.length - 1]?.height;
      }
      if (evmExecuted) {
        let dataMethod = [];
        if (evmExecuted === TYPE_EXPORT.EVMExecutedTxs) {
          dataMethod = response.transaction
            .map((tx) => {
              return tx.data?.substring(0, 8);
            })
            ?.filter((item) => item);
        } else if (
          evmExecuted === TYPE_EXPORT.Erc20Txs ||
          evmExecuted === TYPE_EXPORT.Erc721Txs
        ) {
          dataMethod = response.transaction
            .map((tx) => {
              return tx.evm_transaction.data?.substring(0, 8);
            })
            ?.filter((item) => item);
        }

        const methodIds = [...new Set(dataMethod)];
        const query = {
          query: util.format(
            INDEXER_API_V2.GRAPH_QL.EVM_SIGNATURE_MAPPING,
            chainDB,
          ),
          variables: {
            methodIds: methodIds,
          },
          operationName: INDEXER_API_V2.OPERATION_NAME.EVM_SIGNATURE_MAPPING,
        };

        const listMethodMapping = (
          await this.serviceUtil.fetchDataFromGraphQL(query)
        )?.data[chainDB].evm_signature_mapping;
        listMethods.push(...listMethodMapping);
      }
      result.transaction?.push(...response?.transaction);
      timesLoop++;
    }

    return { result, listMethods };
  }
}
