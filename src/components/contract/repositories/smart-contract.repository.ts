import { InjectRepository } from '@nestjs/typeorm';
import {
  EntityRepository,
  In,
  Not,
  ObjectLiteral,
  Repository,
  SelectQueryBuilder,
} from 'typeorm';
import { AURA_INFO, CONTRACT_STATUS, LENGTH } from '../../../shared';
import { SmartContractCode } from '../../../shared/entities/smart-contract-code.entity';
import { SmartContract } from '../../../shared/entities/smart-contract.entity';
import { ContractParamsDto } from '../dtos/contract-params.dto';

@EntityRepository(SmartContract)
export class SmartContractRepository extends Repository<SmartContract> {
  constructor(
    @InjectRepository(SmartContract)
    private readonly repos: Repository<ObjectLiteral>,
  ) {
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
      const contracts = await _builder
        .limit(request.limit)
        .offset(request.offset)
        .getRawMany();

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
   * @param creatorAddress: Creator address
   * @returns List code id (number[])
   */
  async getCodeIds(creatorAddress: string) {
    const result = await this.createQueryBuilder('sc')
      .select('sc.code_id `codeId`')
      .innerJoin(
        SmartContractCode,
        'scc',
        'scc.code_id = sc.code_id AND scc.creator = sc.creator_address',
      )
      .distinct(true)
      .where({ contract_verification: Not(CONTRACT_STATUS.UNVERIFIED) })
      .andWhere({
        mainnet_upload_status: In([
          CONTRACT_STATUS.REJECTED,
          CONTRACT_STATUS.NOT_REGISTERED,
        ]),
      })
      .andWhere('scc.creator = :creatorAddress', { creatorAddress })
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
}
