import {
  EntityRepository,
  In,
  Not,
  Repository,
  SelectQueryBuilder,
} from 'typeorm';
import { SmartContractCode } from '../../../shared/entities/smart-contract-code.entity';
import { SmartContract } from '../../../shared/entities/smart-contract.entity';
import { ContractParamsDto } from '../dtos/contract-params.dto';

import {
  AURA_INFO,
  CONTRACT_CODE_RESULT,
  CONTRACT_STATUS,
  CONTRACT_TYPE,
  LENGTH,
  SYNC_CONTRACT_TRANSACTION_TYPE,
  Transaction,
} from '../../../shared';
import { Cw721TokenParamsDto } from '../../cw721-token/dtos/cw721-token-params.dto';

@EntityRepository(SmartContract)
export class SmartContractRepository extends Repository<SmartContract> {
  constructor() {
    super();
  }

  async getContracts(request: ContractParamsDto) {
    const builder = this.createQueryBuilder('sc')
      .leftJoin(SmartContractCode, 'scc', 'sc.code_id = scc.code_id')
      .select(['sc.*', 'scc.type `type`', 'scc.result `result`'])
      .orderBy('sc.updated_at', 'DESC');

    const _finalizeResult = async (
      _builder: SelectQueryBuilder<SmartContract>,
    ) => {
      const count = await _builder.getCount();
      if (request.limit > 0) {
        _builder.limit(request.limit).offset(request.offset);
      }

      const contracts = await _builder.getRawMany();

      return [contracts, count];
    };

    if (!request?.keyword) {
      return await _finalizeResult(builder);
    }

    const keyword = request.keyword.toLowerCase();

    const byCodeId = Number(keyword) && Number(keyword) > 0;
    if (byCodeId) {
      builder.where({ code_id: keyword });
      return await _finalizeResult(builder);
    }

    const byCreatorAddress =
      keyword.startsWith(AURA_INFO.CONTRACT_ADDRESS) &&
      keyword.length === LENGTH.ACCOUNT_ADDRESS;
    if (byCreatorAddress) {
      builder.where({ creator_address: keyword });
      return await _finalizeResult(builder);
    }

    const byCreatorOrContractAddress =
      keyword.startsWith(AURA_INFO.CONTRACT_ADDRESS) &&
      keyword.length === LENGTH.CONTRACT_ADDRESS;
    if (byCreatorOrContractAddress) {
      builder
        .where({ contract_address: keyword })
        .orWhere({ creator_address: keyword });
      return await _finalizeResult(builder);
    }

    builder.where('LOWER(sc.contract_name) LIKE :keyword', {
      keyword: `%${keyword}%`,
    });
    return await _finalizeResult(builder);
  }

  async getTokenByContractAddress(contractAddress: string) {
    return await this.createQueryBuilder('sc')
      .select(
        `sc.token_name AS name, sc.token_symbol AS symbol, sc.num_tokens, sc.decimals,
            sc.contract_address, sc.contract_verification, sc.tx_hash, scc.type, sc.request_id`,
      )
      .innerJoin(SmartContractCode, 'scc', 'scc.code_id=sc.code_id')
      .where('sc.contract_address = :contract_address', {
        contract_address: contractAddress,
      })
      .getRawMany();
  }

  async getTokensByListContractAddress(listContractAddress: Array<any>) {
    return await this.createQueryBuilder()
      .select(
        'contract_address, token_name, token_symbol AS symbol, contract_verification',
      )
      .where('contract_address IN (:...listContractAddress)', {
        listContractAddress: listContractAddress,
      })
      .getRawMany();
  }

  async getCw721Tokens(request: Cw721TokenParamsDto) {
    const sqlSelect = `
      sc.token_name AS name,
      sc.token_symbol AS symbol,
      sc.contract_address,
      sc.num_tokens,
      IFNULL(tx_24h.no, 0) AS transfers_24h,
      IFNULL(tx_3d.no, 0) AS transfers_3d,
      uptime.timestamp AS upTime
    `;

    const _createSubQuery = (intervalTime: string) => {
      return (qb: SelectQueryBuilder<Transaction>) => {
        const builder = qb
          .from(Transaction, 'st')
          .select('st.contract_address, COUNT(*) AS no')
          .where({ type: SYNC_CONTRACT_TRANSACTION_TYPE.EXECUTE })
          .andWhere(`st.timestamp > NOW() - INTERVAL ${intervalTime}`)
          .groupBy('st.contract_address');
        return builder;
      };
    };

    const queryBuilder = this.createQueryBuilder('sc')
      .select(sqlSelect)
      .innerJoin(
        SmartContractCode,
        'scc',
        `sc.code_id = scc.code_id AND scc.result = '${CONTRACT_CODE_RESULT.CORRECT}' AND scc.type = '${CONTRACT_TYPE.CW721}'`,
      )
      .leftJoin(
        _createSubQuery('24 HOUR'),
        'tx_24h',
        'tx_24h.contract_address = sc.contract_address',
      )
      .leftJoin(
        _createSubQuery('72 HOUR'),
        'tx_3d',
        'tx_3d.contract_address = sc.contract_address',
      )
      .leftJoin(
        (qb: SelectQueryBuilder<Transaction>) => {
          const builder = qb
            .from(Transaction, 'st')
            .select('st.contract_address, MAX(st.timestamp) AS timestamp')
            .orderBy({ timestamp: 'DESC' })
            .groupBy('st.contract_address');
          return builder;
        },
        'uptime',
        'uptime.contract_address = sc.contract_address',
      )
      .where(
        'LOWER(sc.token_name) LIKE :keyword OR LOWER(sc.contract_address) LIKE :keyword',
        {
          keyword: `%${request.keyword.toLowerCase()}%`,
        },
      )
      .limit(request.limit)
      .offset(request.offset)
      .orderBy(
        request?.sort_column && request?.sort_order
          ? {
              [`${request.sort_column}`]:
                request.sort_order.toLowerCase() === 'asc' ? 'ASC' : 'DESC',
              upTime: 'DESC',
            }
          : { transfers_24h: 'DESC', upTime: 'DESC' },
      );

    const list = await queryBuilder.getRawMany();
    const count = await queryBuilder.getCount();

    return [list, count];
  }
}
