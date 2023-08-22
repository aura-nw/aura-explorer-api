import { Brackets, EntityRepository, Repository } from 'typeorm';
import { PrivateNameTag } from '../../../shared/entities/private-name-tag.entity';
import { Logger } from '@nestjs/common';
import { User } from '../../../shared/entities/user.entity';
import { PAGE_REQUEST } from '../../../shared';

@EntityRepository(PrivateNameTag)
export class PrivateNameTagRepository extends Repository<PrivateNameTag> {
  private readonly _logger = new Logger(PrivateNameTagRepository.name);

  /**
   * Get list name tags
   * @param keyword
   * @param limit
   * @param offset
   * @returns
   */
  async getNameTags(
    user_id: number,
    keyword: string,
    limit: number,
    offset: number,
  ) {
    this._logger.log(
      `============== ${this.getNameTags.name} was called! ==============`,
    );
    const builder = this.createQueryBuilder('tag')
      .select(
        `tag.id,
        tag.address,
        tag.is_favorite,
        tag.type,
        tag.name_tag,
        tag.created_at,
        user.email,
        tag.created_at,
        tag.updated_at`,
      )
      .leftJoin(User, 'user', 'user.id = tag.created_by')
      .where('tag.created_by = :user_id', { user_id });

    const _finalizeResult = async () => {
      const result = await builder
        .limit(limit)
        .offset(offset)
        .orderBy('tag.updated_at', 'DESC')
        .getRawMany();

      const count = await builder.getCount();
      return { result, count };
    };

    if (keyword) {
      builder.andWhere(
        new Brackets((qb) => {
          qb.where('LOWER(tag.address) LIKE LOWER(:keyword)', {
            keyword: `%${keyword}%`,
          }).orWhere('tag.name_tag LIKE :keyword', {
            keyword: `%${keyword}%`,
          });
        }),
      );
    }

    return await _finalizeResult();
  }

  async getNameTagMainSite(
    user_id: number,
    limit: number,
    nextKey: number,
  ): Promise<PrivateNameTag[]> {
    limit = Number(limit) || PAGE_REQUEST.MAX_500;

    if (limit > PAGE_REQUEST.MAX_500) {
      limit = PAGE_REQUEST.MAX_500;
    }

    let qb = this.createQueryBuilder()
      .select([
        'id',
        'is_favorite',
        'address',
        'name_tag',
        'created_at',
        'updated_at',
      ])
      .where('created_by = :user_id', { user_id })
      .limit(Number(limit) || PAGE_REQUEST.MAX_500);

    if (nextKey) {
      qb = qb.andWhere('id > :nextKey', { nextKey });
    }

    return qb.getRawMany();
  }
}
