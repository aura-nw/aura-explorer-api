import {
  Brackets,
  EntityRepository,
  Repository,
  SelectQueryBuilder,
} from 'typeorm';
import { SmartContractCode } from '../../../shared/entities/smart-contract-code.entity';
import { SmartContract } from '../../../shared/entities/smart-contract.entity';
import { ContractParamsDto } from '../dtos/contract-params.dto';

import {
  AURA_INFO,
  CONTRACT_CODE_RESULT,
  CONTRACT_TYPE,
  LENGTH,
  SYNC_CONTRACT_TRANSACTION_TYPE,
  Transaction,
} from '../../../shared';
import { Cw721TokenParamsDto } from '../../cw721-token/dtos/cw721-token-params.dto';
import { ContractCodeIdParamsDto } from '../dtos/contract-code-id-params.dto';

@EntityRepository(SmartContract)
export class SmartContractRepository extends Repository<SmartContract> {
  constructor() {
    super();
  }

  async getContracts(request: ContractParamsDto) {
    const builder = this.createQueryBuilder('sc')
      .leftJoin(SmartContractCode, 'scc', 'sc.code_id = scc.code_id')
      .select([
        'sc.*',
        'scc.type `type`',
        'scc.result `result`',
        'scc.contract_verification `contract_verification`',
        'scc.compiler_version `compiler_version`',
        'scc.url `url`',
        'scc.verified_at `verified_at`',
        'scc.instantiate_msg_schema `instantiate_msg_schema`',
        'scc.query_msg_schema `query_msg_schema`',
        'scc.execute_msg_schema `execute_msg_schema`',
        'scc.contract_hash `contract_hash`',
        'scc.s3_location `s3_location`',
      ])
      .orderBy('sc.updated_at', 'DESC')
      .addOrderBy('sc.id', 'DESC');

    if (request.contractType && request.contractType.length > 0) {
      builder.where(
        new Brackets((qb) => {
          qb.where('scc.type IN (:contractType)', {
            contractType: request.contractType,
          });
          if (request.contractType.includes('')) {
            qb.orWhere('scc.type IS NULL');
            qb.orWhere(`scc.result = '${CONTRACT_CODE_RESULT.TBD}'`);
            qb.orWhere(`scc.result = '${CONTRACT_CODE_RESULT.INCORRECT}'`);
          } else {
            qb.andWhere(`scc.result = '${CONTRACT_CODE_RESULT.CORRECT}'`);
          }
        }),
      );
    }

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
      builder.andWhere({ code_id: keyword });
      return await _finalizeResult(builder);
    }

    const byCreatorAddress =
      keyword.startsWith(AURA_INFO.CONTRACT_ADDRESS) &&
      keyword.length === LENGTH.ACCOUNT_ADDRESS;
    if (byCreatorAddress) {
      builder.andWhere({ creator_address: keyword });
      return await _finalizeResult(builder);
    }

    const byCreatorOrContractAddress =
      keyword.startsWith(AURA_INFO.CONTRACT_ADDRESS) &&
      keyword.length === LENGTH.CONTRACT_ADDRESS;
    if (byCreatorOrContractAddress) {
      builder.andWhere(
        new Brackets((qb) => {
          qb.where({ contract_address: keyword }).orWhere({
            creator_address: keyword,
          });
        }),
      );
      return await _finalizeResult(builder);
    }

    builder.andWhere('LOWER(sc.contract_name) LIKE :keyword', {
      keyword: `%${keyword}%`,
    });
    return await _finalizeResult(builder);
  }

  async getContractsByContractAddress(contractAddress: string) {
    return await this.createQueryBuilder('sc')
      .leftJoin(SmartContractCode, 'scc', 'sc.code_id = scc.code_id')
      .select([
        'sc.*',
        'scc.type `type`',
        'scc.result `result`',
        'scc.contract_verification `contract_verification`',
        'scc.compiler_version `compiler_version`',
        'scc.url `url`',
        'scc.verified_at `verified_at`',
        'scc.instantiate_msg_schema `instantiate_msg_schema`',
        'scc.query_msg_schema `query_msg_schema`',
        'scc.execute_msg_schema `execute_msg_schema`',
        'scc.contract_hash `contract_hash`',
        'scc.s3_location `s3_location`',
      ])
      .orderBy('sc.updated_at', 'DESC')
      .where('sc.contract_address = :contract_address', {
        contract_address: contractAddress,
      })
      .getRawOne();
  }

  async getTokenByContractAddress(contractAddress: string) {
    return await this.createQueryBuilder('sc')
      .select(
        `sc.token_name AS name, sc.token_symbol AS symbol, sc.num_tokens, sc.decimals,
            sc.contract_address, scc.contract_verification, sc.tx_hash, scc.type, sc.request_id`,
      )
      .innerJoin(SmartContractCode, 'scc', 'scc.code_id=sc.code_id')
      .where('sc.contract_address = :contract_address', {
        contract_address: contractAddress,
      })
      .getRawMany();
  }

  async getContractCW4973(minterAddress: string) {
    return await this.createQueryBuilder('sc')
      .select(`sc.contract_address AS contract_address, sc.code_id AS code_id`)
      .innerJoin(SmartContractCode, 'scc', 'scc.code_id=sc.code_id')
      .where('sc.minter_address = :contract_address', {
        contract_address: minterAddress,
      })
      .andWhere('scc.type = :type', {
        type: CONTRACT_TYPE.CW4973,
      })
      .andWhere(`scc.result = '${CONTRACT_CODE_RESULT.CORRECT}'`)
      .getRawMany();
  }

  async getTokensByListContractAddress(listContractAddress: Array<any>) {
    return await this.createQueryBuilder('sc')
      .select(
        'sc.contract_address, sc.token_name, sc.token_symbol AS symbol, scc.contract_verification, sc.decimals',
      )
      .leftJoin(SmartContractCode, 'scc', 'scc.code_id=sc.code_id')
      .where('sc.contract_address IN (:...listContractAddress)', {
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
      sc.total_tx,
      IFNULL(tx_24h_ta.no, 0) + IFNULL(tx_24h_ca.no, 0) AS transfers_24h,
      uptime.timestamp AS upTime
    `;

    const _createSubQuery = (intervalTime: string, targetColumn: string) => {
      return (qb: SelectQueryBuilder<Transaction>) => {
        const builder = qb
          .from(Transaction, 'st')
          .select(`st.${targetColumn}, COUNT(*) AS no`)
          .where({ type: SYNC_CONTRACT_TRANSACTION_TYPE.EXECUTE })
          .andWhere(`st.timestamp > NOW() - INTERVAL ${intervalTime}`)
          .groupBy(`st.${targetColumn}`);
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
        _createSubQuery('24 HOUR', 'to_address'),
        'tx_24h_ta',
        'tx_24h_ta.to_address = sc.contract_address',
      )
      .leftJoin(
        _createSubQuery('24 HOUR', 'contract_address'),
        'tx_24h_ca',
        'tx_24h_ca.contract_address = sc.contract_address',
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
          keyword: `%${(request.keyword || '').toLowerCase()}%`,
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
      )
      .addOrderBy('sc.id', 'DESC');

    const list = await queryBuilder.getRawMany();
    const count = await queryBuilder.getCount();

    return [list, count];
  }

  /**
   * Get smart contract by minter
   * @param minterAddress
   * @param keyword
   * @param limit
   * @param offset
   */
  async getContractByMinter(
    minterAddress: string,
    keyword: string,
    limit: number,
    offset: number,
  ) {
    const builder = this.createQueryBuilder('sm')
      .select('sm.id, sm.contract_address, sm.minter_address')
      .innerJoin(
        SmartContractCode,
        'smc',
        `sm.code_id = smc.code_id AND smc.result = '${CONTRACT_CODE_RESULT.CORRECT}' AND smc.type = '${CONTRACT_TYPE.CW4973}'`,
      )
      .where({
        minter_address: minterAddress,
      });

    const _finalizeResult = async (
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      _builder: SelectQueryBuilder<SmartContract>,
    ) => {
      const data = await builder
        .limit(limit)
        .offset(offset)
        .orderBy('sm.created_at', 'DESC')
        .getRawMany();

      const count = await builder.getCount();
      return { contracts: data, count };
    };

    if (!keyword) {
      return await _finalizeResult(builder);
    }

    builder.andWhere('LOWER(sm.contract_address) LIKE :keyword', {
      keyword: `%${keyword}%`,
    });
    return await _finalizeResult(builder);
  }

  /**
   * Get list tokens of soulbound
   * @param keyword
   * @param limit
   * @param offset
   * @returns
   */
  async getSoulboundTokensList(keyword: string, limit: number, offset: number) {
    const builder = this.createQueryBuilder('sm')
      .select(
        'sm.id, sm.contract_address, sm.token_name, sm.minter_address, sm.created_at, sm.token_symbol',
      )
      .innerJoin(
        SmartContractCode,
        'scc',
        `sm.code_id = scc.code_id AND scc.result = '${CONTRACT_CODE_RESULT.CORRECT}' AND scc.type = '${CONTRACT_TYPE.CW4973}'`,
      );
    const _finalizeResult = async (
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      _builder: SelectQueryBuilder<SmartContract>,
    ) => {
      const tokens = await builder
        .limit(limit)
        .offset(offset)
        .orderBy('sm.created_at', 'DESC')
        .groupBy('sm.contract_address, sm.minter_address')
        .getRawMany();

      const count = await builder.getCount();
      return { tokens, count };
    };

    if (keyword) {
      builder.andWhere(
        new Brackets((qb) => {
          qb.where('LOWER(sm.contract_address) LIKE :keyword', {
            keyword: `%${keyword}%`,
          })
            .orWhere('LOWER(sm.minter_address) LIKE :keyword', {
              keyword: `%${keyword}%`,
            })
            .orWhere('LOWER(sm.token_name) LIKE LOWER(:keyword)', {
              keyword: `%${keyword}%`,
            });
        }),
      );
    }
    return await _finalizeResult(builder);
  }

  async getContractsCodeId(request: ContractCodeIdParamsDto) {
    const builder = this.createQueryBuilder('sc')
      .select([
        'sc.code_id, scc.type, scc.result, scc.tx_hash, sbt.instantiates, sbt.verified_at, sbt.creator, sbt.created_at, sbt.updated_at, MAX(sc.id) as id',
      ])
      .leftJoin(SmartContractCode, 'scc', `sc.code_id = scc.code_id`)
      .leftJoin(
        (qb: SelectQueryBuilder<SmartContract>) => {
          const queryBuilder = qb
            .from(SmartContract, 'sc')
            .select(
              'sc.code_id, count(sc.code_id) AS instantiates, min(sc.verified_at) AS verified_at, MIN(sc.creator_address) AS creator, MIN(sc.created_at) as created_at, MAX(sc.updated_at) as updated_at',
            )
            .groupBy('sc.code_id');
          return queryBuilder;
        },
        'sbt',
        'sbt.code_id = sc.code_id',
      )
      .orderBy('sbt.updated_at', 'DESC')
      .groupBy('sc.code_id');

    const _finalizeResult = async (
      _builder: SelectQueryBuilder<SmartContract>,
    ) => {
      const count = (await _builder.getRawMany()).length;
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
      builder.andWhere({ code_id: keyword });
    }

    const byCreatorAddress =
      keyword.startsWith(AURA_INFO.CONTRACT_ADDRESS) &&
      keyword.length === LENGTH.ACCOUNT_ADDRESS;
    if (byCreatorAddress) {
      builder.andWhere('sbt.creator = :keyword', {
        keyword: keyword,
      });
    }

    const byCreatorOrContractAddress =
      keyword.startsWith(AURA_INFO.CONTRACT_ADDRESS) &&
      keyword.length === LENGTH.CONTRACT_ADDRESS;
    if (byCreatorOrContractAddress) {
      builder.andWhere(
        new Brackets((qb) => {
          qb.where('sc.contract_address = :keyword', {
            keyword: keyword,
          }).orWhere('sbt.creator = :keyword', {
            keyword: keyword,
          });
        }),
      );
    }
    return await _finalizeResult(builder);
  }

  async getContractsCodeIdDetail(codeId: number) {
    return await this.createQueryBuilder('sc')
      .select([
        'sc.code_id, MAX(sc.compiler_version) AS compiler_version, MAX(sc.url) AS url, MAX(sc.id) as id, scc.type, scc.result, scc.tx_hash, sbt.instantiates, sbt.verified_at, sbt.creator, sbt.created_at, sbt.updated_at',
      ])
      .leftJoin(SmartContractCode, 'scc', `sc.code_id = scc.code_id`)
      .leftJoin(
        (qb: SelectQueryBuilder<SmartContract>) => {
          const queryBuilder = qb
            .from(SmartContract, 'sc')
            .select(
              'sc.code_id, count(sc.code_id) AS instantiates, min(sc.verified_at) AS verified_at, MIN(sc.creator_address) AS creator, MIN(sc.created_at) as created_at, MAX(sc.updated_at) as updated_at',
            )
            .groupBy('sc.code_id');
          return queryBuilder;
        },
        'sbt',
        'sbt.code_id = sc.code_id',
      )
      .where('sc.code_id = :code_id', {
        code_id: codeId,
      })
      .groupBy('sc.code_id')
      .getRawOne();
  }
}
