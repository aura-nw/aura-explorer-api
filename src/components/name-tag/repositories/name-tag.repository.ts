import { Brackets, EntityRepository, Repository } from 'typeorm';
import { NameTag } from '../../../shared/entities/name-tag.entity';
import { Logger, NotFoundException } from '@nestjs/common';
import { User } from '../../../shared/entities/user.entity';
import {
  ADMIN_ERROR_MAP,
  NAME_TAG_TYPE,
  USER_ROLE,
  VIEW_TYPE,
} from '../../../shared';
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
    viewType: VIEW_TYPE,
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

    const where = await this.getWhereByUser(user, viewType);
    builder.where(where);

    return await _finalizeResult();
  }

  async getNameTag(user: User, id: number): Promise<NameTag> {
    this._logger.log(
      `============== ${this.getNameTag.name} was called! ==============`,
    );
    const nameTag = await this.findOne({
      where: {
        id,
      },
    });

    if (!nameTag) {
      throw new NotFoundException('Name tag not found');
    }

    if (
      (user.role === USER_ROLE.USER && nameTag.created_by === user.id) ||
      (user.role === USER_ROLE.ADMIN &&
        nameTag.view_type === VIEW_TYPE.PRIVATE &&
        nameTag.created_by === user.id) ||
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
      throw new NotFoundException('Name tag not found');
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
    viewType: VIEW_TYPE,
  ): Promise<string> {
    if (!user) {
      return `tag.view_type = 'public'`;
    } else if (user.role === USER_ROLE.ADMIN) {
      if (viewType === VIEW_TYPE.PUBLIC) {
        return `tag.view_type = 'public'`;
      } else {
        return `tag.created_by = ${user.id} AND tag.view_type = '${viewType}'`;
      }
    } else if (user.role === USER_ROLE.USER) {
      return `tag.created_by = ${user.id} AND tag.view_type = 'private'`;
    }
  }
}
