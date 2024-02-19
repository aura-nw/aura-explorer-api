import { Logger } from '@nestjs/common';
import { EntityRepository, Repository } from 'typeorm';
import { Asset } from '../../../shared';

@EntityRepository(Asset)
export class AssetsRepository extends Repository<Asset> {
  private readonly _logger = new Logger(AssetsRepository.name);

  async countAssetsHavingCoinId() {
    this._logger.log(
      `============== ${this.countAssetsHavingCoinId.name} was called! ==============`,
    );
    const sqlSelect = `tm.denom, tm.coin_id`;

    const queryBuilder = this.createQueryBuilder('tm')
      .select(sqlSelect)
      .where("tm.coin_id <> '' ");

    return await queryBuilder.getCount();
  }

  async getAssetsHavingCoinId(limit: number, pageIndex: number) {
    this._logger.log(
      `============== ${this.getAssetsHavingCoinId.name} was called! ==============`,
    );
    const sqlSelect = ` tm.coin_id`;

    const queryBuilder = this.createQueryBuilder('tm')
      .select(sqlSelect)
      .where("tm.coin_id <> '' ")
      .limit(limit)
      .offset(pageIndex * limit);

    return await queryBuilder.getRawMany();
  }

  /**
   * Retrieves IBC token with statistics for a specified number of days.
   *
   * @param {exploreId} int - chain id
   * @param {number} days - The number of days to retrieve token statistics for. Defaults to 2.
   * @return {Promise<Asset[]>} - A Promise that resolves to an array of Asset data.
   */
  async getIbcTokenWithStatistics(exploreId, days = 2): Promise<Asset[]> {
    this._logger.log(
      `============== ${this.getIbcTokenWithStatistics.name} was called! ==============`,
    );
    return this.createQueryBuilder('tokenMarket')
      .leftJoinAndSelect(
        'tokenMarket.tokenHolderStatistics',
        'tokenHolderStatistics',
        'DATE(tokenHolderStatistics.created_at) > DATE(NOW() - INTERVAL :days DAY)',
        { days },
      )
      .where('denom is not null')
      .andWhere('explorer_id = :exploreId', { exploreId })
      .getMany();
  }
}
