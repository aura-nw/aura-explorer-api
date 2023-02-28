import {
  Brackets,
  EntityRepository,
  Repository,
  SelectQueryBuilder,
} from 'typeorm';
import { AURA_INFO, LENGTH } from '../../../shared';
import { SmartContractCode } from '../../../shared/entities/smart-contract-code.entity';
import { SmartContract } from '../../../shared/entities/smart-contract.entity';
import { ContractCodeIdParamsDto } from '../../contract/dtos/contract-code-id-params.dto';

@EntityRepository(SmartContractCode)
export class SmartContractCodeRepository extends Repository<SmartContractCode> {
  async getContractsCodeId(request: ContractCodeIdParamsDto) {
    const builder = this.createQueryBuilder('scc')
      .select(['scc.*, IFNULL(sbt.instantiates,0) AS instantiates'])
      .leftJoin(
        (qb: SelectQueryBuilder<SmartContract>) => {
          const queryBuilder = qb
            .from(SmartContract, 'sc')
            .select('sc.code_id, count(sc.code_id) AS instantiates')
            .groupBy('sc.code_id');
          return queryBuilder;
        },
        'sbt',
        'sbt.code_id = scc.code_id',
      )
      .orderBy('scc.updated_at', 'DESC');

    const _finalizeResult = async (
      _builder: SelectQueryBuilder<SmartContractCode>,
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
    } else if (keyword.length === LENGTH.CONTRACT_ADDRESS) {
      builder.innerJoin(
        (sqb: SelectQueryBuilder<SmartContract>) => {
          const subQueryBuilder = sqb
            .from(SmartContract, 'ssc')
            .select('ssc.code_id `ssc_code_id`')
            .where({ contract_address: keyword });
          return subQueryBuilder;
        },
        'sbq',
        'sbq.ssc_code_id = scc.code_id',
      );
    } else {
      builder.where({ creator: keyword });
    }

    return await _finalizeResult(builder);
  }

  async getContractsCodeIdDetail(codeId: number) {
    return await this.createQueryBuilder('scc')
      .select(['scc.*, IFNULL(sbt.instantiates,0) AS instantiates'])
      .leftJoin(
        (qb: SelectQueryBuilder<SmartContract>) => {
          const queryBuilder = qb
            .from(SmartContract, 'sc')
            .select('sc.code_id, count(sc.code_id) AS instantiates')
            .groupBy('sc.code_id');
          return queryBuilder;
        },
        'sbt',
        'sbt.code_id = scc.code_id',
      )
      .where('scc.code_id = :code_id', {
        code_id: codeId,
      })
      .getRawOne();
  }
}
