import { Logger } from '@nestjs/common';
import {
  Brackets,
  EntityRepository,
  Equal,
  In,
  Repository,
  SelectQueryBuilder,
} from 'typeorm';
import { SoulboundToken, SOULBOUND_TOKEN_STATUS } from '../../../shared';
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
      .select('sbt.*, sm.token_name')
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
      builder.andWhere(
        new Brackets((qb) => {
          qb.where('LOWER(sbt.receiver_address) LIKE :keyword', {
            keyword: `%${keyword}%`,
          })
            .orWhere('LOWER(sbt.token_uri) LIKE :keyword', {
              keyword: `%${keyword}%`,
            })
            .orWhere('LOWER(sm.token_name) LIKE :keyword', {
              keyword: `%${keyword}%`,
            });
        }),
      );
    }

    if (status) {
      builder.andWhere('sbt.status = :status', {
        status,
      });
    }
    return await _finalizeResult(builder);
  }

  /**
   * Get list tokens by receiver address
   * @param receiverAddress
   * @param isEquipToken
   * @param limit
   * @param offset
   * @returns
   */
  async getTokenByReceiverAddress(
    receiverAddress: string,
    isEquipToken: string,
    limit: number,
    offset: number,
  ) {
    this._logger.log(
      `============== ${this.getTokenByReceiverAddress.name} was called! ==============`,
    );
    const builder = this.createQueryBuilder('sbt').select('sbt.*').where({
      receiver_address: receiverAddress,
    });
    const _finalizeResult = async (
      _builder: SelectQueryBuilder<SoulboundToken>,
    ) => {
      const tokens = await builder
        .limit(limit)
        .offset(offset)
        .orderBy('sbt.updated_at', 'DESC')
        .getRawMany();

      const count = await builder.getCount();
      return { tokens, count };
    };

    if (isEquipToken === 'true') {
      builder.andWhere({ status: Equal(SOULBOUND_TOKEN_STATUS.EQUIPPED) });
    } else {
      builder.andWhere({
        status: In([
          SOULBOUND_TOKEN_STATUS.UNCLAIM,
          SOULBOUND_TOKEN_STATUS.UNEQUIPPED,
        ]),
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
