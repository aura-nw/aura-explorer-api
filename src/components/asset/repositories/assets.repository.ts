import { Logger } from '@nestjs/common';
import { Brackets, EntityRepository, IsNull, Not, Repository } from 'typeorm';
import { Asset } from '../../../shared';

@EntityRepository(Asset)
export class AssetsRepository extends Repository<Asset> {
  private readonly _logger = new Logger(AssetsRepository.name);

  async countAssetsHavingCoinId() {
    this._logger.log(
      `============== ${this.countAssetsHavingCoinId.name} was called! ==============`,
    );
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [_, count] = await this.findAndCount({
      where: {
        coinId: Not(''),
      },
    });

    return count;
  }

  async getAssetsHavingCoinId(limit: number, pageIndex: number) {
    this._logger.log(
      `============== ${this.getAssetsHavingCoinId.name} was called! ==============`,
    );
    const data = await this.find({
      where: {
        coinId: Not(''),
      },
      take: limit,
      skip: pageIndex * limit,
      order: {
        id: 'ASC',
      },
    });

    return data.map((item) => item.coinId);
  }

  async getAssets(keyword, limit = 1, offset = 0, type = '', explorerId = 1) {
    this._logger.log(
      `============== ${this.getAssets.name} was called! ==============`,
    );

    const builder = this.createQueryBuilder('asset')
      .where('asset.name IS NOT NULL')
      .andWhere("asset.name <> ''")
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

  async getAssetsDetail(denom, explorerId = 1, days = 2) {
    this._logger.log(
      `============== ${this.getAssetsDetail.name} was called! ==============`,
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
    return this.createQueryBuilder()
      .insert()
      .into(Asset)
      .values(listAsset)
      .orUpdate(['total_supply', 'type'], ['denom'])
      .orIgnore()
      .execute();
  }
}
