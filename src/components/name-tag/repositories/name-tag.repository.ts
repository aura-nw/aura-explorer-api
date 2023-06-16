import { Brackets, EntityRepository, Repository } from 'typeorm';
import { NameTag } from '../../../shared/entities/name-tag.entity';
import { Logger } from '@nestjs/common';
import { User } from '../../../shared/entities/user.entity';

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
        'tag.id, tag.address, tag.type, tag.name_tag, tag.created_at, user.email',
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
}
