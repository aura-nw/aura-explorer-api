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
    keywordEncrypt: string,
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
        tag.note,
        tag.is_favorite as isFavorite,
        tag.type,
        tag.name_tag as nameTag,
        tag.created_at as createdAt,
        tag.updated_at as updatedAt`,
      )
      .leftJoin(User, 'user', 'user.id = tag.created_by')
      .where('tag.created_by = :user_id', { user_id });

    const _finalizeResult = async () => {
      const result = await builder
        .limit(limit)
        .offset(offset)
        .orderBy('tag.is_favorite', 'DESC')
        .addOrderBy('tag.updated_at', 'DESC')
        .getRawMany();

      const count = await builder.getCount();
      const countFavorite = result.filter(
        (item) => item.isFavorite == 1,
      ).length;
      return { result, count, countFavorite };
    };

    if (keyword) {
      builder.andWhere(
        new Brackets((qb) => {
          qb.where('tag.address = :keyword', {
            keyword: `${keyword}`,
          }).orWhere('tag.name_tag = :keywordEncrypt', {
            keywordEncrypt: `${keywordEncrypt}`,
          });
        }),
      );
    }

    return await _finalizeResult();
  }
}
