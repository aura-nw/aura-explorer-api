import { Logger } from '@nestjs/common';
import { Explorer } from 'src/shared/entities/explorer.entity';
import { Brackets, EntityRepository, Repository } from 'typeorm';

@EntityRepository(Explorer)
export class ExplorerRepository extends Repository<Explorer> {
  private readonly _logger = new Logger(ExplorerRepository.name);

  async getExplorers(
    keyword: string,
    limit = 1,
    offset = 0,
    explorers: number[],
  ) {
    this._logger.log(
      `============== ${this.getExplorers.name} was called! ==============`,
    );

    const builder = this.createQueryBuilder('explorer').where(
      'explorer.name IS NOT NULL',
    );

    const _finalizeResult = async () => {
      const result: Explorer[] = await builder
        .limit(limit)
        .offset(offset)
        .addOrderBy('explorer.id', 'DESC')
        .getMany();

      const count = await builder.getCount();
      return { result, count };
    };

    if (explorers.length > 0) {
      builder.andWhere(
        new Brackets((qb) => {
          qb.where('explorer.id IN (:...explorers)', {
            explorers,
          });
        }),
      );
    }

    if (keyword) {
      console.log(keyword);
      builder.andWhere(
        new Brackets((qb) => {
          qb.where('explorer.chain_id =:chainId', {
            chainId: keyword,
          });
        }),
      );
    }

    return await _finalizeResult();
  }

  async getExplorerDetail(denom: string, explorerId = 1, days = 2) {
    this._logger.log(
      `============== ${this.getExplorerDetail.name} was called! ==============`,
    );
  }

  async getAssetById(id: number) {
    return await this.findOne(id);
  }
}
