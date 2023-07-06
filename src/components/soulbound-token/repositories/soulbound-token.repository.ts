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
      .where(`sbt.contract_address=:contractAddress`, {
        contractAddress,
      });
    const _finalizeResult = async () => {
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
            .orWhere('LOWER(sbt.token_id) LIKE :keyword', {
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
    return await _finalizeResult();
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
    keyword: string,
    limit: number,
    offset: number,
  ) {
    this._logger.log(
      `============== ${this.getTokenByReceiverAddress.name} was called! ==============`,
    );
    const builder = this.createQueryBuilder('sbt').select('sbt.*').where({
      receiver_address: receiverAddress,
    });
    const _finalizeResult = async () => {
      const tokens = await builder
        .limit(limit)
        .offset(offset)
        .orderBy('sbt.is_notify', 'DESC')
        .addOrderBy('sbt.status', 'ASC')
        .addOrderBy('sbt.updated_at', 'DESC')
        .getRawMany();

      const count = await builder.getCount();
      return { tokens, count };
    };

    if (keyword) {
      builder.andWhere(
        new Brackets((qb) => {
          qb.where('LOWER(sbt.token_id) LIKE :keyword', {
            keyword: `%${keyword}%`,
          }).orWhere('LOWER(sbt.token_name) LIKE LOWER(:keyword)', {
            keyword: `%${keyword}%`,
          });
        }),
      );
    }

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
    return await _finalizeResult();
  }

  async getPickedToken(receiverAddress: string, limit: number) {
    this._logger.log(
      `============== ${this.getPickedToken.name} was called! ==============`,
    );

    const builder = this.createQueryBuilder('sbt')
      .select('sbt.*')
      .where({
        receiver_address: receiverAddress,
      })
      .andWhere(
        new Brackets((qb) => {
          qb.where({
            picked: true,
          });
        }),
      );

    const _finalizeResult = async (
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      _builder: SelectQueryBuilder<SoulboundToken>,
    ) => {
      const tokens = await builder
        .limit(limit)
        .orderBy('sbt.updated_at', 'ASC')
        .getRawMany();

      const count = await builder.getCount();
      return { tokens, count };
    };

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
      .select('sbt.contract_address, sbt.status, COUNT(sbt.id) as quantity')
      .where({
        contract_address: In(contractAddress),
      })
      .groupBy('sbt.contract_address, sbt.`status`')
      .getRawMany();
  }

  async updateNotify(tokenId, contractAddress) {
    return await this.createQueryBuilder('sbt')
      .update(SoulboundToken)
      .set({
        is_notify: false,
      })
      .where('token_id = :tokenId', { tokenId })
      .andWhere('contract_address = :contractAddress', { contractAddress })
      .execute();
  }

  async updateRejectStatus(
    tokenId,
    contractAddress,
    receiverAddress,
    rejectAll,
  ) {
    const builder = await this.createQueryBuilder('sbt')
      .update(SoulboundToken)
      .set({
        status: SOULBOUND_TOKEN_STATUS.REJECTED,
        is_notify: false,
      })
      .where({ contract_address: In(contractAddress) })
      .andWhere({ status: Equal(SOULBOUND_TOKEN_STATUS.UNCLAIM) })
      .andWhere('receiver_address = :receiverAddress', { receiverAddress });
    if (!rejectAll) {
      builder.andWhere('token_id = :tokenId', { tokenId });
    }
    return builder.execute();
  }
}
