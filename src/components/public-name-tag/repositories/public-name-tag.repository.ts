import { Brackets, EntityRepository, Repository } from 'typeorm';
import { PublicNameTag } from '../../../shared/entities/public-name-tag.entity';
import { Logger } from '@nestjs/common';
import { User } from '../../../shared/entities/user.entity';
import { PAGE_REQUEST } from '../../../shared';

@EntityRepository(PublicNameTag)
export class PublicNameTagRepository extends Repository<PublicNameTag> {
  private readonly _logger = new Logger(PublicNameTagRepository.name);

  /**
   * Get list name tags
   * @param keyword
   * @param limit
   * @param offset
   * @returns
   */
  async getPublicNameTags(keyword: string, limit: number, offset: number) {
    this._logger.log(
      `============== ${this.getPublicNameTags.name} was called! ==============`,
    );
    const builder = this.createQueryBuilder('public_name_tag')
      .select(
        `public_name_tag.id,
        public_name_tag.address,
        public_name_tag.type,
        public_name_tag.name_tag,
        public_name_tag.created_at,
        user.email,
        enterprise_url as enterpriseUrl`,
      )
      .leftJoin(User, 'user', 'user.id = public_name_tag.updated_by');

    const _finalizeResult = async () => {
      const result = await builder
        .limit(limit)
        .offset(offset)
        .orderBy('public_name_tag.updated_at', 'DESC')
        .getRawMany();

      const count = await builder.getCount();
      return { result, count };
    };

    if (keyword) {
      builder.andWhere(
        new Brackets((qb) => {
          qb.where('LOWER(public_name_tag.address) LIKE LOWER(:keyword)', {
            keyword: `%${keyword}%`,
          }).orWhere('public_name_tag.name_tag LIKE :keyword', {
            keyword: `%${keyword}%`,
          });
        }),
      );
    }

    return await _finalizeResult();
  }

  async getNameTagMainSite(
    limit: number,
    nextKey: number,
  ): Promise<PublicNameTag[]> {
    limit = Number(limit) || PAGE_REQUEST.MAX_500;

    if (limit > PAGE_REQUEST.MAX_500) {
      limit = PAGE_REQUEST.MAX_500;
    }

    let qb = this.createQueryBuilder()
      .select(['id', 'address', 'name_tag', 'enterprise_url as enterpriseUrl'])
      .limit(Number(limit) || PAGE_REQUEST.MAX_500);

    if (nextKey) {
      qb = qb.andWhere('id > :nextKey', { nextKey });
    }

    return qb.getRawMany();
  }
}
