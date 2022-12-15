import { Logger } from '@nestjs/common';
import { EntityRepository, In, Repository, SelectQueryBuilder } from 'typeorm';
import { SoulboundToken } from '../../../shared';
import { SmartContract } from '../../../shared/entities/smart-contract.entity';

@EntityRepository(SoulboundToken)
export class SoulboundTokenRepository extends Repository<SoulboundToken> {
  private readonly _logger = new Logger(SoulboundTokenRepository.name);

  /**
   * Get list tokens by minter address and contract address
   * @param minterAddress
   * @param contractAddress
   * @param keyword
   * @param status
   * @param limit
   * @param offset
   * @returns
   */
  async getTokens(
    minterAddress: string,
    contractAddress: string,
    keyword: string,
    status: string,
    limit: number,
    offset: number,
  ) {
    this._logger.log(
      `============== ${this.getTokens.name} was called! ==============`,
    );
    const builder = this.createQueryBuilder('sbt')
      .select('sbt.*')
      .innerJoin(
        SmartContract,
        'sm',
        'sm.contract_address = sbt.contract_address',
      )
      .where(
        `sm.minter_address=:minterAddress AND sm.contract_address=:contractAddress`,
        {
          minterAddress,
          contractAddress,
        },
      );
    const _finalizeResult = async (
      _builder: SelectQueryBuilder<SoulboundToken>,
    ) => {
      const tokens = await builder
        .limit(limit)
        .offset(offset)
        .orderBy('sbt.created_at', 'DESC')
        .getRawMany();

      const count = await builder.getCount();
      return { tokens, count };
    };

    if (keyword) {
      builder.andWhere('LOWER(sbt.receiver_address) LIKE :keyword', {
        keyword: `%${keyword}%`,
      });
    }

    if (status) {
      builder.andWhere('sbt.status = :status', {
        status,
      });
    }
    return await _finalizeResult(builder);
  }

  /**
   * Count the number of group tokens by status
   * @param contractIds
   * @returns
   */
  countStatus(contractAddress: Array<string>) {
    this._logger.log(
      `============== ${this.countStatus.name} was called! ==============`,
    );
    return this.createQueryBuilder('sbt')
      .select('sbt.contract_address, COUNT(sbt.id) as quanity')
      .where({
        contract_address: In(contractAddress),
      })
      .groupBy('sbt.contract_address, sbt.`status`')
      .getRawMany();
  }
}
