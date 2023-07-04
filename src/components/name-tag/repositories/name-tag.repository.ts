import { Brackets, EntityRepository, Repository } from 'typeorm';
import { NameTag } from '../../../shared/entities/name-tag.entity';
import { Logger } from '@nestjs/common';
import { User } from '../../../shared/entities/user.entity';
import { PAGE_REQUEST } from '../../../shared';

@EntityRepository(NameTag)
export class NameTagRepository extends Repository<NameTag> {
  private readonly _logger = new Logger(NameTagRepository.name);

  /**
   * Get list name tags
   * @param keyword
   * @param limit
   * @param offset
   * @returns
   */
  async getNameTags(keyword: string, limit: number, offset: number) {
    this._logger.log(
      `============== ${this.getNameTags.name} was called! ==============`,
    );
    const builder = this.createQueryBuilder('tag')
      .select(
        `tag.id,
        tag.address,
        tag.type,
        tag.name_tag,
        tag.created_at,
        user.email,
        enterprise_url as enterpriseUrl`,
      )
      .leftJoin(User, 'user', 'user.id = tag.updated_by')
      .where('tag.deleted_at IS NULL');

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

  async getNameTag(
    keyword: string[],
    limit: number,
    nextKey: number,
  ): Promise<NameTag[]> {
    limit = Number(limit) || PAGE_REQUEST.MAX_200;

    if (limit > PAGE_REQUEST.MAX_200) {
      limit = PAGE_REQUEST.MAX_200;
    }

    let qb = this.createQueryBuilder()
      .select(['id', 'address', 'name_tag', 'enterprise_url as enterpriseUrl'])
      .limit(Number(limit) || PAGE_REQUEST.MAX_200);

    if (keyword?.length == 1) {
      qb = qb.where('LOWER(name_tag) LIKE LOWER(:name_tag) ', {
        name_tag: `%${keyword[0]}%`,
      });
    } else if (keyword?.length > 1) {
      qb = qb.where('address IN(:...addresses)', { addresses: keyword });
    }

    if (nextKey) {
      qb = qb.andWhere('id > :nextKey', { nextKey });
    }

    return qb.getRawMany();
  }
}
