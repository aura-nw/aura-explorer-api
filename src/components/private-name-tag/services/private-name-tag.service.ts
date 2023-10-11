import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  ADMIN_ERROR_MAP,
  AURA_INFO,
  AkcLogger,
  LENGTH,
  REGEX_PARTERN,
  RequestContext,
} from '../../../shared';
import { PrivateNameTagParamsDto } from '../dtos/private-name-tag-params.dto';
import { PrivateNameTagRepository } from '../repositories/private-name-tag.repository';
import { CreatePrivateNameTagParamsDto } from '../dtos/create-private-name-tag-params.dto';
import { PrivateNameTag } from '../../../shared/entities/private-name-tag.entity';
import { UpdatePrivateNameTagParamsDto } from '../dtos/update-private-name-tag-params.dto';
import { EncryptionService } from '../../encryption/encryption.service';
import { ServiceUtil } from '../../../shared/utils/service.util';
import { Not } from 'typeorm';
import * as appConfig from '../../../shared/configs/configuration';

@Injectable()
export class PrivateNameTagService {
  private config;

  constructor(
    private readonly logger: AkcLogger,
    private encryptionService: EncryptionService,
    private privateNameTagRepository: PrivateNameTagRepository,
    private serviceUtil: ServiceUtil,
  ) {
    this.config = appConfig.default();
  }

  async getNameTags(ctx: RequestContext, req: PrivateNameTagParamsDto) {
    this.logger.log(ctx, `${this.getNameTags.name} was called!`);
    const { result, count } = await this.privateNameTagRepository.getNameTags(
      ctx.user.id,
      req.keyword,
      await this.encryptionService.encrypt(req.keyword ?? ''),
      req.limit,
      req.offset,
    );
    const data = await Promise.all(
      result.map(async (item) => {
        item.nameTag = await this.encryptionService.decrypt(item.nameTag);
        return item;
      }),
    );

    return { data, count };
  }

  async getNameTagsDetail(ctx: RequestContext, id: number) {
    this.logger.log(ctx, `${this.getNameTags.name} was called!`);
    const entity = await this.privateNameTagRepository.findOne(id, {
      where: { createdBy: ctx.user.id },
    });
    if (!entity) {
      throw new NotFoundException('Private Name Tag not found');
    }
    entity.nameTag = await this.encryptionService.decrypt(entity.nameTag);

    return entity;
  }

  async createNameTag(ctx: RequestContext, req: CreatePrivateNameTagParamsDto) {
    this.logger.log(ctx, `${this.createNameTag.name} was called!`);
    const errorMsg = await this.validate(0, ctx.user.id, req);
    if (errorMsg) {
      return errorMsg;
    }
    const entity = new PrivateNameTag();
    entity.address = req.address;
    entity.isFavorite = req.isFavorite;
    entity.type = req.type;
    entity.note = req.note;
    entity.nameTag = await this.encryptionService.encrypt(req.nameTag);
    entity.createdBy = ctx.user.id;

    try {
      const result = await this.privateNameTagRepository.save(entity);
      return { data: result, meta: {} };
    } catch (err) {
      this.logger.error(
        ctx,
        `Class ${PrivateNameTagService.name} call ${this.createNameTag.name} error ${err?.code} method error: ${err?.stack}`,
      );
      throw new BadRequestException(err);
    }
  }

  async updateNameTag(
    ctx: RequestContext,
    id: number,
    req: UpdatePrivateNameTagParamsDto,
  ) {
    this.logger.log(ctx, `${this.updateNameTag.name} was called!`);
    const request: CreatePrivateNameTagParamsDto = { ...req, address: '' };
    const errorMsg = await this.validate(id, ctx.user.id, request, false);
    if (errorMsg) {
      return errorMsg;
    }

    const entity = await this.privateNameTagRepository.findOne(id, {
      where: { createdBy: ctx.user.id },
    });
    if (!entity) {
      throw new NotFoundException('Private Name Tag not found');
    }

    entity.createdBy = ctx.user.id;
    entity.updatedAt = new Date();

    const entitySave = { ...entity, ...req };
    if (req.nameTag) {
      entitySave.nameTag = await this.encryptionService.encrypt(req.nameTag);
    }

    try {
      const result = await this.privateNameTagRepository.update(id, entitySave);
      return { data: result, meta: {} };
    } catch (err) {
      this.logger.error(
        ctx,
        `Class ${PrivateNameTagService.name} call ${this.updateNameTag.name} error ${err?.code} method error: ${err?.stack}`,
      );
      throw new BadRequestException(err);
    }
  }

  async deleteNameTag(ctx: RequestContext, id: number) {
    this.logger.log(ctx, `${this.updateNameTag.name} was called!`);
    try {
      const entity = await this.privateNameTagRepository.findOne(id, {
        where: { createdBy: ctx.user.id },
      });
      if (!entity) {
        throw new NotFoundException("Don't have Owner Private Name Tag");
      }
      return await this.privateNameTagRepository.delete(id);
    } catch (err) {
      this.logger.error(
        ctx,
        `Class ${PrivateNameTagService.name} call ${this.updateNameTag.name} error ${err?.code} method error: ${err?.stack}`,
      );
      throw new BadRequestException(err);
    }
  }

  private async validate(
    id: number,
    user_id: number,
    req: CreatePrivateNameTagParamsDto,
    isCreate = true,
  ) {
    if (req.nameTag && !req.nameTag?.match(REGEX_PARTERN.NAME_TAG)) {
      return {
        code: ADMIN_ERROR_MAP.INVALID_NAME_TAG.Code,
        message: ADMIN_ERROR_MAP.INVALID_NAME_TAG.Message,
      };
    }

    if (isCreate) {
      const validFormat = await this.serviceUtil.isValidBech32Address(
        req.address,
      );

      if (!validFormat) {
        return {
          code: ADMIN_ERROR_MAP.INVALID_FORMAT.Code,
          message: ADMIN_ERROR_MAP.INVALID_FORMAT.Message,
        };
      }

      // check limited private name tag
      const count = await this.privateNameTagRepository.count({
        where: { createdBy: user_id },
      });

      if (count >= this.config.limitedPrivateNameTag) {
        return {
          code: ADMIN_ERROR_MAP.LIMIT_PRIVATE_NAME_TAG.Code,
          message: ADMIN_ERROR_MAP.LIMIT_PRIVATE_NAME_TAG.Message,
        };
      }

      // check duplicate address
      const entity = await this.privateNameTagRepository.findOne({
        where: { createdBy: user_id, address: req.address },
      });
      if (entity) {
        return {
          code: ADMIN_ERROR_MAP.DUPLICATE_ADDRESS.Code,
          message: ADMIN_ERROR_MAP.DUPLICATE_ADDRESS.Message,
        };
      }
    }

    // check duplicate private name tag
    const entity = await this.privateNameTagRepository.findOne({
      where: {
        id: Not(id),
        createdBy: user_id,
        nameTag: await this.encryptionService.encrypt(req.nameTag ?? ''),
      },
    });
    if (entity) {
      return {
        code: ADMIN_ERROR_MAP.DUPLICATE_PRIVATE_TAG.Code,
        message: ADMIN_ERROR_MAP.DUPLICATE_PRIVATE_TAG.Message,
      };
    }

    return false;
  }
}
