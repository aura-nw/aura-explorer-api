import { Brackets, EntityRepository, Repository } from 'typeorm';
import { NameTag } from '../../../shared/entities/name-tag.entity';
import { Logger, NotFoundException } from '@nestjs/common';
import { User } from '../../../shared/entities/user.entity';
import {
  ADMIN_ERROR_MAP,
  MESSAGES,
  NAME_TAG_TYPE,
  USER_ROLE,
  VIEW_TYPE,
} from '../../../shared';
import * as util from 'util';
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
  async getNameTags(
    user: User,
    keyword: string,
    limit: number,
    offset: number,
    view_type: VIEW_TYPE,
  ) {
    this._logger.log(
      `============== ${this.getNameTags.name} was called! ==============`,
    );
    const builder = this.createQueryBuilder('tag')
      .leftJoinAndSelect('tag.user', 'user')
      .select(
        'tag.id, tag.address, tag.type, tag.view_type, tag.name_tag, tag.created_at, user.email',
      );

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
          qb.andWhere('LOWER(tag.address) LIKE LOWER(:keyword)', {
            keyword: `%${keyword}%`,
          }).orWhere('tag.name_tag LIKE :keyword', {
            keyword: `%${keyword}%`,
          });
        }),
      );
    }

    const where = await this.getWhereByUser(user, view_type);
    builder.where(where);

    return await _finalizeResult();
  }

  async getNameTagById(user: User, id: number): Promise<NameTag> {
    this._logger.log(
      `============== ${this.getNameTagById.name} was called! ==============`,
    );
    const nameTag = await this.findOne({
      where: {
        id,
      },
    });

    if (!nameTag) {
      throw new NotFoundException(
        util.format(MESSAGES.ERROR.NOT_FOUND, 'Tag name'),
      );
    }

    if (
      (user?.role === USER_ROLE.USER && nameTag.created_by === user?.id) ||
      (user?.role === USER_ROLE.ADMIN &&
        nameTag.view_type === VIEW_TYPE.PRIVATE &&
        nameTag.created_by === user?.id) ||
      nameTag.view_type === VIEW_TYPE.PUBLIC
    ) {
      return nameTag;
    }

    return null;
  }

  async getNameTagDetailByAddress(
    user: User,
    address: string,
    type: NAME_TAG_TYPE,
  ) {
    const nameTags = await this.find({
      where: { address, type },
    });

    if (user) {
      const filterByPrivate = nameTags.filter(
        (name) =>
          name.view_type === VIEW_TYPE.PRIVATE && name.created_by === user.id,
      );
      if (filterByPrivate.length > 0) {
        return filterByPrivate[0];
      }
    }

    const filterByPublic = nameTags.filter(
      (name) => name.view_type === VIEW_TYPE.PUBLIC,
    );

    if (filterByPublic.length > 0) {
      return filterByPublic[0];
    }
  }

  async deleteNameTag(user: User, id: number) {
    const nameTag = await this.findOne({
      where: {
        id,
      },
    });

    if (!nameTag) {
      throw new NotFoundException(
        util.format(MESSAGES.ERROR.NOT_FOUND, 'Tag name'),
      );
    }

    if (user?.role === USER_ROLE.USER && nameTag?.created_by != user?.id) {
      return {
        code: ADMIN_ERROR_MAP.UNAUTHORIZED.Code,
        message: ADMIN_ERROR_MAP.UNAUTHORIZED.Message,
      };
    }

    return await this.delete(id);
  }

  private async getWhereByUser(
    user: User,
    view_type: VIEW_TYPE,
  ): Promise<string> {
    if (!user) {
      return `tag.view_type = 'public'`;
    } else if (user.role === USER_ROLE.ADMIN) {
      if (view_type === VIEW_TYPE.PUBLIC) {
        return `tag.view_type = 'public'`;
      } else {
        return `tag.created_by = ${user.id} AND tag.view_type = '${view_type}'`;
      }
    } else if (user.role === USER_ROLE.USER) {
      return `tag.created_by = ${user.id} AND tag.view_type = 'private'`;
    }
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
      .select(['id', 'address', 'name_tag'])
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
