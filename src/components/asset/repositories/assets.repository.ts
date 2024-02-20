import { Logger } from '@nestjs/common';
import { Brackets, EntityRepository, Repository } from 'typeorm';
import { ASSETS_TYPE, Asset } from '../../../shared';
import { AssetParamsDto } from '../dtos/asset-params.dto';

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
   * @param {number} days - The number of days to retrieve token statistics for. Defaults to 2.
   * @return {Promise<Asset[]>} - A Promise that resolves to an array of Asset data.
   */
  async getTokenWithStatistics(days = 2): Promise<Asset[]> {
    this._logger.log(
      `============== ${this.getTokenWithStatistics.name} was called! ==============`,
    );
    return this.createQueryBuilder('asset')
      .leftJoinAndSelect(
        'asset.tokenHolderStatistics',
        'tokenHolderStatistics',
        'DATE(tokenHolderStatistics.created_at) > DATE(NOW() - INTERVAL :days DAY)',
        { days },
      )
      .where('type IN :type', { type: [ASSETS_TYPE.IBC, ASSETS_TYPE.NATIVE] })
      .getMany();
  }

  async getAssets(param: AssetParamsDto, days = 2) {
    this._logger.log(
      `============== ${this.getAssets.name} was called! ==============`,
    );

    const builder = this.createQueryBuilder('asset')
      .select('asset.*')
      .leftJoinAndSelect(
        'asset.tokenHolderStatistics',
        'tokenHolderStatistics',
        'DATE(tokenHolderStatistics.created_at) > DATE(NOW() - INTERVAL :days DAY)',
        { days },
      );

    const _finalizeResult = async () => {
      const result = await builder
        .limit(param.limit)
        .offset(param.offset)
        .addOrderBy('asset.verify_status', 'DESC')
        .addOrderBy('asset.total_supply', 'DESC')
        .getRawMany();

      const count = await builder.getCount();
      return { result, count };
    };

    if (param.keyword) {
      builder.andWhere(
        new Brackets((qb) => {
          qb.where('LOWER(asset.denom) =:keyword', {
            keyword: `${param.keyword}`,
          })
            .orWhere('LOWER(asset.name) LIKE :keyword', {
              keyword: `%${param.keyword}%`,
            })
            .orWhere('LOWER(asset.symbol) LIKE :keyword', {
              keyword: `%${param.keyword}%`,
            });
        }),
      );
    }

    if (param.type?.length > 0) {
      builder.andWhere('sbt.type IN :type', {
        type: param.type,
      });
    }
    return await _finalizeResult();
  }
}
