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
  CONTRACT_TRANSACTION_TYPE,
  CONTRACT_TYPE,
  LENGTH,
} from '../../../shared';
import { Cw721TokenParamsDto } from 'src/components/cw721-token/dtos/cw721-token-params.dto';

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

  /**
   * Get list code id
   * @description get code ids for 'Register Contracts to Deploy on Mainnet' screen.
   * The code ids just for creator who owner that code (not deployer).
   * So must to join smart_contract_codes to make sure that code id has synced and belong to creator
   * @param creatorAddress: Creator address
   * @returns List code id (number[])
   */
  async getCodeIds(creatorAddress: string) {
    const result = await this.createQueryBuilder('sc')
      .innerJoin(
        SmartContractCode,
        'scc',
        'scc.code_id = sc.code_id AND scc.creator = sc.creator_address',
      )
      .distinct(true)
      .select('sc.code_id `codeId`')
      .where({ contract_verification: Not(CONTRACT_STATUS.UNVERIFIED) })
      .andWhere({
        mainnet_upload_status: In([
          CONTRACT_STATUS.REJECTED,
          CONTRACT_STATUS.NOT_REGISTERED,
        ]),
      })
      .andWhere({ creator_address: creatorAddress })
      .orderBy('sc.code_id', 'ASC')
      .getRawMany();

    return result.map((item) => Number(item.codeId));
  }

  /**
   * Get list contract by Creator address
   * @param creatorAddress
   * @param codeId: Code id of contract
   * @param status: Status of contract
   * @param limit: Number of record on per page
   * @param offset: Numer of record to skip
   * @returns @returns List contract(any[])
   */
  async getContractByCreator(
    creatorAddress: string,
    codeId: number,
    status: string,
    limit: number,
    offset: number,
  ) {
    const mainnetUploadStatus = [
      CONTRACT_STATUS.TBD,
      CONTRACT_STATUS.DEPLOYED,
      CONTRACT_STATUS.REJECTED,
      CONTRACT_STATUS.PENDING,
      CONTRACT_STATUS.NOT_REGISTERED,
      CONTRACT_STATUS.APPROVED,
    ];

    const builder = this.createQueryBuilder('sc')
      .leftJoin(SmartContractCode, 'scc', 'scc.code_id = sc.code_id')

      // select
      .select('sc.*, scc.type `type`, scc.result `result`')
      .addSelect(
        `IF(
          sc.mainnet_upload_status IN (:mainnetUploadStatus),
          sc.mainnet_upload_status,
          sc.contract_verification
        )`,
        'status',
      )
      .setParameters({ mainnetUploadStatus })
      // select

      .orderBy('sc.updated_at', 'DESC')
      .where({ creator_address: creatorAddress });

    if (codeId) {
      builder.andWhere('sc.code_id LIKE :codeId', { codeId: `%${codeId}%` });
    }

    if (status) {
      const isFilterContractVerificationStatus = [
        CONTRACT_STATUS.UNVERIFIED,
        CONTRACT_STATUS.EXACT_MATCH,
        CONTRACT_STATUS.SIMILAR_MATCH,
      ].includes(<CONTRACT_STATUS>status);

      if (isFilterContractVerificationStatus) {
        builder.andWhere({ contract_verification: status });
      } else {
        builder.andWhere({ mainnet_upload_status: status });
      }
    }

    const count = await builder.getCount();
    const contracts = await builder.limit(limit).offset(offset).getRawMany();

    return [contracts, count];
  }

  async getTokenByContractAddress(contractAddress: string) {
    return await this.createQueryBuilder('sc')
      .select(
        `sc.token_name AS name, sc.token_symbol AS symbol, sc.num_tokens,
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
      .select('contract_address, token_name, token_symbol AS symbol')
      .where('contract_address IN (:...listContractAddress)', {
        listContractAddress: listContractAddress,
      })
      .getRawMany();
  }

  async getCw721Tokens(request: Cw721TokenParamsDto) {
    const sqlSelect = ` sc.token_name AS name, sc.token_symbol AS symbol, sc.contract_address, sc.num_tokens,
    (SELECT COUNT(id)
        FROM transactions
        WHERE contract_address = sc.contract_address
            AND type = '${CONTRACT_TRANSACTION_TYPE.EXECUTE}'
            AND timestamp > NOW() - INTERVAL 24 HOUR) AS transfers_24h,
    (SELECT COUNT(id)
        FROM transactions
        WHERE contract_address = sc.contract_address
            AND type = '${CONTRACT_TRANSACTION_TYPE.EXECUTE}'
            AND timestamp > NOW() - INTERVAL 72 HOUR) AS transfers_3d,
    (SELECT timestamp
        FROM transactions
        WHERE contract_address = sc.contract_address
        ORDER BY timestamp DESC
        LIMIT 1) AS upTime`;

    const queryBuilder = this.createQueryBuilder('sc')
      .select(sqlSelect)
      .innerJoin(
        SmartContractCode,
        'scc',
        `sc.code_id = scc.code_id AND scc.result = '${CONTRACT_CODE_RESULT.CORRECT}' AND scc.type = '${CONTRACT_TYPE.CW721}'`,
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
