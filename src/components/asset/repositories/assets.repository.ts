import { Logger } from '@nestjs/common';
import { Brackets, EntityRepository, Repository } from 'typeorm';
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

  async getAssets(keyword, limit = 1, offset = 0, type = '', explorerId = 1) {
    this._logger.log(
      `============== ${this.getAssets.name} was called! ==============`,
    );

    const builder = this.createQueryBuilder('asset')
      .where('asset.name IS NOT NULL')
      .andWhere('asset.explorer_id=:explorerId', {
        explorerId,
      });

    const _finalizeResult = async () => {
      const result: Asset[] = await builder
        .limit(limit)
        .offset(offset)
        .orderBy(`CASE WHEN asset.\`type\`='NATIVE' THEN 0 ELSE 1 END`)
        .addOrderBy('asset.verify_status', 'DESC')
        .addOrderBy('asset.total_supply', 'DESC')
        .getMany();

      const count = await builder.getCount();
      return { result, count };
    };

    if (keyword) {
      builder.andWhere(
        new Brackets((qb) => {
          qb.where('asset.denom =:address', {
            address: keyword,
          })
            .orWhere('asset.denom =:ibc', {
              ibc: `ibc/${keyword}`,
            })
            .orWhere('LOWER(asset.name) LIKE LOWER(:keyword)', {
              keyword: `%${keyword}%`,
            })
            .orWhere('LOWER(asset.symbol) LIKE LOWER(:keyword)', {
              keyword: `%${keyword}%`,
            });
        }),
      );
    }

    const assetType = !!type ? type.split(',') : [];
    if (assetType?.length > 0) {
      builder.andWhere('asset.type IN(:...type)', {
        type: assetType,
      });
    }

    return await _finalizeResult();
  }

  async getAssetsDetail(denom, days = 2, explorerId = 1) {
    this._logger.log(
      `============== ${this.getAssets.name} was called! ==============`,
    );
    return await this.createQueryBuilder('asset')
      .leftJoinAndSelect(
        'asset.tokenHolderStatistics',
        'tokenHolderStatistics',
        'DATE(tokenHolderStatistics.date) > DATE(NOW() - INTERVAL :days DAY)',
        { days },
      )
      .where('asset.explorer_id=:explorerId', {
        explorerId,
      })
      .andWhere(
        new Brackets((qb) => {
          qb.where('asset.denom =:denom', {
            denom: `${denom}`,
          }).orWhere('asset.denom =:ibcDenom', {
            ibcDenom: `ibc/${denom}`,
          });
        }),
      )
      .getMany();
  }

  /**
   * Insert Or Update Asset.
   *
   * @param {listAsset} List - list data Asset
   */
  async storeAsset(listAsset) {
    await this.query(`ALTER TABLE \`asset\` AUTO_INCREMENT = 1`);
    return this.createQueryBuilder()
      .insert()
      .into(Asset)
      .values(listAsset)
      .orUpdate(['total_supply', 'type'], ['denom'])
      .orIgnore()
      .execute();
  }
}
