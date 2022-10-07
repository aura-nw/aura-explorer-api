import { InjectRepository } from '@nestjs/typeorm';
import { EntityRepository, ObjectLiteral, Repository } from 'typeorm';
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
import { SmartContractCode } from '../../../shared/entities/smart-contract-code.entity';
import { Cw721TokenParamsDto } from 'src/components/cw721-token/dtos/cw721-token-params.dto';

@EntityRepository(SmartContract)
export class SmartContractRepository extends Repository<SmartContract> {
  constructor(
    @InjectRepository(SmartContract)
    private readonly repos: Repository<ObjectLiteral>,
  ) {
    super();
  }

  async getContracts(request: ContractParamsDto) {
    const result = [];
    const params = [];
    const sqlSelect = `SELECT sc.*, scc.type, scc.result`;
    const sqlCount = `SELECT COUNT(sc.Id) AS total`;
    let sql = ` FROM smart_contracts sc
            LEFT JOIN smart_contract_codes scc ON sc.code_id = scc.code_id`;
    if (request?.keyword) {
      const keyword = request.keyword.toLowerCase();
      if (Number(keyword) && Number(keyword) > 0) {
        sql += ` WHERE sc.code_id = ?`;
        params.push(keyword);
      } else if (
        keyword.startsWith(AURA_INFO.CONNTRACT_ADDRESS) &&
        keyword.length === LENGTH.CONTRACT_ADDRESS
      ) {
        sql += ` WHERE (sc.contract_address = ? OR sc.creator_address = ?)`;
        params.push(keyword);
        params.push(keyword);
      } else if (
        keyword.startsWith(AURA_INFO.CONNTRACT_ADDRESS) &&
        keyword.length === LENGTH.ACCOUNT_ADDRESS
      ) {
        sql += ` WHERE sc.creator_address = ?`;
        params.push(keyword);
      } else {
        sql += ` WHERE LOWER(sc.contract_name) LIKE ?`;
        params.push(`%${keyword}%`);
      }
    }
    sql += ' ORDER BY sc.updated_at DESC';
    let sqlLimit = '';
    if (request.limit > 0) {
      sqlLimit = ' LIMIT ? OFFSET ?';
      params.push(request.limit);
      params.push(request.offset);
    }

    result[0] = await this.query(sqlSelect + sql + sqlLimit, params);
    result[1] = await this.query(sqlCount + sql, params);
    return result;
  }

  /**
   * Get list code id
   * @param creatorAddress: Creator address
   * @returns List code id (number[])
   */
  async getCodeIds(creatorAddress: string) {
    return await this.createQueryBuilder('sm')
      .select('sm.code_id AS codeId')
      .innerJoin(
        SmartContractCode,
        'smCode',
        'smCode.code_id=sm.code_id AND smCode.creator = sm.creator_address',
      )
      .distinct(true)
      .where(
        `sm.contract_verification != '${CONTRACT_STATUS.UNVERIFIED}'
                AND sm.mainnet_upload_status IN('${CONTRACT_STATUS.REJECTED}','${CONTRACT_STATUS.NOT_REGISTERED}')
                AND smCode.creator=:creatorAddress`,
      )
      .setParameter('creatorAddress', creatorAddress)
      .orderBy('sm.code_id', 'ASC')
      .getRawMany();
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
    let conditions = `creator_address=:creatorAddress`;
    const params = { creatorAddress };

    if (codeId) {
      conditions += ` AND sm.code_id LIKE :codeId`;
      params['codeId'] = `%${codeId}%`;
    }

    if (status) {
      if (
        status === CONTRACT_STATUS.UNVERIFIED ||
        status === CONTRACT_STATUS.EXACT_MATCH ||
        status === CONTRACT_STATUS.SIMILAR_MATCH
      ) {
        conditions += ` AND sm.contract_verification=:status`;
      } else {
        conditions += ` AND sm.mainnet_upload_status=:status`;
      }
      params['status'] = status;
    }

    const constracts = await this.createQueryBuilder('sm')
      .select(
        `sm.*, smCode.type, (CASE WHEN(
                sm.mainnet_upload_status = '${CONTRACT_STATUS.TBD}'
                OR sm.mainnet_upload_status = '${CONTRACT_STATUS.DEPLOYED}'
                OR sm.mainnet_upload_status = '${CONTRACT_STATUS.REJECTED}'
                OR sm.mainnet_upload_status = '${CONTRACT_STATUS.PENDING}'
                OR sm.mainnet_upload_status = '${CONTRACT_STATUS.NOT_REGISTERED}'
                OR sm.mainnet_upload_status = '${CONTRACT_STATUS.APPROVED}'
            ) THEN sm.mainnet_upload_status ELSE sm.contract_verification END) AS status,
            smCode.result`,
      )
      .leftJoin(SmartContractCode, 'smCode', 'smCode.code_id=sm.code_id')
      .distinct(true)
      .where(conditions)
      .setParameters(params)
      .limit(limit)
      .offset(offset)
      .orderBy('sm.updated_at', 'DESC')
      .getRawMany();

    const count = await this.createQueryBuilder('sm')
      .select(`COUNT(DISTINCT sm.id) AS total`)
      .leftJoin(SmartContractCode, 'smCode', 'smCode.code_id=sm.code_id')
      .where(conditions)
      .setParameters(params)
      .getRawOne();

    return [constracts, Number(count?.total) || 0];
  }

  // tambv1 start
  async getTokenByContractAddress(contractAddress: string) {
    return await this.createQueryBuilder('sc')
      .select(
        `sc.token_name AS name, sc.token_symbol AS symbol, sc.num_tokens,
            sc.contract_address, sc.contract_verification, sc.tx_hash, scc.type`,
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
