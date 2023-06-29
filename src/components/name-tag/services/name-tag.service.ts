import { Injectable, NotFoundException } from '@nestjs/common';
import {
  ADMIN_ERROR_MAP,
  AURA_INFO,
  AkcLogger,
  LENGTH,
  MESSAGES,
  NAME_TAG_TYPE,
  RequestContext,
  USER_ROLE,
  VIEW_TYPE,
} from '../../../shared';
import { NameTagParamsDto } from '../dtos/name-tag-params.dto';
import { NameTagRepository } from '../repositories/name-tag.repository';
import { StoreNameTagParamsDto } from '../dtos/store-name-tag-params.dto';
import { UserService } from '../../../components/user/user.service';
import { User } from '../../../shared/entities/user.entity';
import * as util from 'util';
import { GetNameTagDto } from '../dtos/get-name-tag.dto';
import { GethNameTagResult } from '../dtos/get-name-tag-result.dto';
import * as appConfig from '../../../shared/configs/configuration';

@Injectable()
export class NameTagService {
  constructor(
    private readonly logger: AkcLogger,
    private nameTagRepository: NameTagRepository,
    private userService: UserService,
  ) {
    this.appParams = appConfig.default();
  }

  private appParams;

  async getNameTags(ctx: RequestContext, req: NameTagParamsDto) {
    this.logger.log(ctx, `${this.getNameTags.name} was called!`);
    const user = await this.userService.findOneById(ctx.user?.id || 0);

    const { result, count } = await this.nameTagRepository.getNameTags(
      user,
      req.keyword,
      req.limit,
      req.offset,
      req.view_type,
    );

    return { result, count };
  }

  async isLimitPrivateNameTag(
    user: User,
    req: StoreNameTagParamsDto,
  ): Promise<boolean> {
    if (!user || req.view_type !== VIEW_TYPE.PRIVATE) {
      return false;
    }

    console.log(`user: ${JSON.stringify(user)}`);
    const [, count] = await this.nameTagRepository.findAndCount({
      where: {
        created_by: user.id,
        view_type: VIEW_TYPE.PRIVATE,
      },
    });

    return count >= Number(this.appParams.privateNameTagLimit);
  }

  async getNameTagsDetail(ctx: RequestContext, id: number) {
    this.logger.log(ctx, `${this.getNameTagsDetail.name} was called!`);
    const user = await this.userService.findOneById(ctx.user?.id || 0);

    return await this.nameTagRepository.getNameTagById(user, id);
  }

  async getNameTagDetailByAddress(
    ctx: RequestContext,
    address: string,
    type: NAME_TAG_TYPE,
  ): Promise<StoreNameTagParamsDto> {
    this.logger.log(ctx, `${this.getNameTagDetailByAddress.name} was called!`);
    const user = await this.userService.findOneById(ctx.user?.id || 0);

    const nameTag = await this.nameTagRepository.getNameTagDetailByAddress(
      user,
      address,
      type,
    );

    return StoreNameTagParamsDto.toDto(nameTag);
  }

  async createNameTag(ctx: RequestContext, req: StoreNameTagParamsDto) {
    this.logger.log(ctx, `${this.createNameTag.name} was called!`);
    const user = await this.userService.findOneById(ctx.user?.id || 0);
    const errorMsg = await this.validate(req, user, true);
    if (errorMsg) {
      return errorMsg;
    }
    if (await this.isLimitPrivateNameTag(user, req)) {
      return {
        code: ADMIN_ERROR_MAP.LIMIT.Code,
        message: ADMIN_ERROR_MAP.LIMIT.Message,
      };
    }

    const entity = StoreNameTagParamsDto.toModel(req);
    entity.created_by = user.id;
    entity.updated_by = user.id;

    try {
      const result = await this.nameTagRepository.save(entity);
      return { data: result, meta: {} };
    } catch (err) {
      this.logger.error(
        ctx,
        `Class ${NameTagService.name} call ${this.createNameTag.name} error ${err?.code} method error: ${err?.stack}`,
      );
    }
  }

  async updateNameTag(
    ctx: RequestContext,
    req: StoreNameTagParamsDto,
    id: number,
  ) {
    this.logger.log(ctx, `${this.updateNameTag.name} was called!`);
    const user = await this.userService.findOneById(ctx.user?.id || 0);
    const errorMsg = await this.validate(req, user, false);
    if (errorMsg) {
      return errorMsg;
    }

    try {
      const nameTag = await this.nameTagRepository.findOne({
        where: {
          id,
        },
      });
      if (!nameTag) {
        throw new NotFoundException(
          util.format(MESSAGES.ERROR.NOT_FOUND, 'Tag name'),
        );
      }

      const entity = StoreNameTagParamsDto.toModel(req);
      entity.updated_by = user.id;

      const nameTagUpdate = { ...nameTag, ...entity };
      nameTagUpdate.id = id;

      const result = await this.nameTagRepository.update(
        nameTagUpdate.id,
        nameTagUpdate,
      );
      return { data: result, meta: {} };
    } catch (err) {
      this.logger.error(
        ctx,
        `Class ${NameTagService.name} call ${this.updateNameTag.name} error ${err?.code} method error: ${err?.stack}`,
      );
      throw err;
    }
  }

  async deleteNameTag(ctx: RequestContext, id: number) {
    this.logger.log(ctx, `${this.deleteNameTag.name} was called!`);
    try {
      const user = await this.userService.findOneById(ctx.user?.id || 0);
      return await this.nameTagRepository.deleteNameTag(user, id);
    } catch (err) {
      this.logger.error(
        ctx,
        `Class ${NameTagService.name} call ${this.deleteNameTag.name} error ${err?.code} method error: ${err?.stack}`,
      );
      throw err;
    }
  }

  private async validate(
    req: StoreNameTagParamsDto,
    user: User,
    isCreate: boolean,
  ) {
    const validFormat =
      (req.address.startsWith(AURA_INFO.CONTRACT_ADDRESS) &&
        req.address.length === LENGTH.CONTRACT_ADDRESS &&
        req.type === NAME_TAG_TYPE.CONTRACT) ||
      (req.address.length === LENGTH.ACCOUNT_ADDRESS &&
        req.type === NAME_TAG_TYPE.ACCOUNT);

    if (!validFormat) {
      return {
        code: ADMIN_ERROR_MAP.INVALID_FORMAT.Code,
        message: ADMIN_ERROR_MAP.INVALID_FORMAT.Message,
      };
    }

    const tag = await this.nameTagRepository.findOne({
      where: {
        address: req.address,
        created_by: user.id,
        view_type: req.view_type,
      },
    });

    if (user) {
      // Only Admin can create/update public name tag
      if (user.role != USER_ROLE.ADMIN) {
        if (req.view_type === VIEW_TYPE.PUBLIC) {
          return {
            code: ADMIN_ERROR_MAP.UNAUTHORIZED.Code,
            message: ADMIN_ERROR_MAP.UNAUTHORIZED.Message,
          };
        }
      }
    }

    if (tag) {
      // Check owner private Name Tag can be update
      if (user.role === USER_ROLE.USER && user.id !== tag?.created_by) {
        return {
          code: ADMIN_ERROR_MAP.UNAUTHORIZED.Code,
          message: ADMIN_ERROR_MAP.UNAUTHORIZED.Message,
        };
      }

      if (isCreate) {
        return {
          code: ADMIN_ERROR_MAP.DUPLICATE_TAG.Code,
          message: ADMIN_ERROR_MAP.DUPLICATE_TAG.Message,
        };
      } else if (tag.name_tag === req.name_tag) {
        return {
          code: ADMIN_ERROR_MAP.DUPLICATE_TAG.Code,
          message: ADMIN_ERROR_MAP.DUPLICATE_TAG.Message,
        };
      }
    }

    return false;
  }

  async getNameTag(
    ctx: RequestContext,
    req: GetNameTagDto,
  ): Promise<GethNameTagResult> {
    const user = await this.userService.findOneById(ctx.user?.id || 0);

    const nameTags = await this.nameTagRepository.getNameTag(
      user,
      req.keyword,
      Number(req.limit),
      Number(req.nextKey),
    );

    let nextKey: number | null;

    if (nameTags.length <= 1) {
      nextKey = null;
    } else {
      nextKey = nameTags.slice(-1)[0]?.id;
    }

    const data = {
      data: { nameTags },
      nextKey,
    };

    return data;
  }
}
