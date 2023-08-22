import { Injectable, NotFoundException } from '@nestjs/common';
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
import { GetPrivateNameTagResult } from '../dtos/get-private-name-tag-result.dto';
import { Not } from 'typeorm';
import { PrivateNameTag } from '../../../shared/entities/private-name-tag.entity';
import { UpdatePrivateNameTagParamsDto } from '../dtos/update-private-name-tag-params.dto';
import { EncryptionService } from '../../encryption/encryption.service';
import { ServiceUtil } from '../../../shared/utils/service.util';

@Injectable()
export class PrivateNameTagService {
  constructor(
    private readonly logger: AkcLogger,
    private encryptionService: EncryptionService,
    private privateNameTagRepository: PrivateNameTagRepository,
    private serviceUtil: ServiceUtil,
  ) {}

  async getNameTags(ctx: RequestContext, req: PrivateNameTagParamsDto) {
    this.logger.log(ctx, `${this.getNameTags.name} was called!`);
    const { result, count } = await this.privateNameTagRepository.getNameTags(
      ctx.user.id,
      req.keyword,
      req.limit,
      req.offset,
    );
    const data = await Promise.all(
      result.map(async (item) => {
        item.name_tag = await this.encryptionService.decrypt(item.name_tag);
        return item;
      }),
    );

    return { data, count };
  }

  async getNameTagsDetail(ctx: RequestContext, id: number) {
    this.logger.log(ctx, `${this.getNameTags.name} was called!`);
    const entity = await this.privateNameTagRepository.findOne(id, {
      where: { created_by: ctx.user.id },
    });
    if (!entity) {
      throw new NotFoundException('Private Name Tag not found');
    }
    entity.name_tag = await this.encryptionService.decrypt(entity.name_tag);

    return entity;
  }

  async createNameTag(ctx: RequestContext, req: CreatePrivateNameTagParamsDto) {
    this.logger.log(ctx, `${this.createNameTag.name} was called!`);
    const errorMsg = await this.validate(req);
    if (errorMsg) {
      return errorMsg;
    }
    const entity = new PrivateNameTag();
    entity.address = req.address;
    entity.type = req.type;
    entity.note = req.note;
    entity.name_tag = await this.encryptionService.encrypt(req.nameTag);
    entity.created_by = ctx.user.id;

    try {
      const result = await this.privateNameTagRepository.save(entity);
      return { data: result, meta: {} };
    } catch (err) {
      this.logger.error(
        ctx,
        `Class ${PrivateNameTagService.name} call ${this.createNameTag.name} error ${err?.code} method error: ${err?.stack}`,
      );
    }
  }

  async updateNameTag(
    ctx: RequestContext,
    id: number,
    req: UpdatePrivateNameTagParamsDto,
  ) {
    this.logger.log(ctx, `${this.updateNameTag.name} was called!`);
    const entity = await this.privateNameTagRepository.findOne(id, {
      where: { created_by: ctx.user.id },
    });
    if (!entity) {
      throw new NotFoundException('Private Name Tag not found');
    }

    const storeNameTagDto = new CreatePrivateNameTagParamsDto();
    storeNameTagDto.address = entity.address;
    storeNameTagDto.nameTag = req.nameTag;
    storeNameTagDto.type = entity.type;

    const errorMsg = await this.validate(storeNameTagDto, false);
    if (errorMsg) {
      return errorMsg;
    }
    entity.type = req.type;
    entity.name_tag = await this.encryptionService.encrypt(req.nameTag);
    entity.created_by = ctx.user.id;
    entity.note = req.note;

    try {
      const result = await this.privateNameTagRepository.update(id, entity);
      return { data: result, meta: {} };
    } catch (err) {
      this.logger.error(
        ctx,
        `Class ${PrivateNameTagService.name} call ${this.updateNameTag.name} error ${err?.code} method error: ${err?.stack}`,
      );
    }
  }

  async deleteNameTag(ctx: RequestContext, id: number) {
    this.logger.log(ctx, `${this.updateNameTag.name} was called!`);
    try {
      const entity = await this.privateNameTagRepository.findOne(id, {
        where: { created_by: ctx.user.id },
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
    }
  }

  private async validate(req: CreatePrivateNameTagParamsDto, isCreate = true) {
    const validFormat = await this.serviceUtil.isValidBech32Address(
      req.address,
    );

    if (!validFormat) {
      return {
        code: ADMIN_ERROR_MAP.INVALID_FORMAT.Code,
        message: ADMIN_ERROR_MAP.INVALID_FORMAT.Message,
      };
    }
    if (!req.nameTag.match(REGEX_PARTERN.NAME_TAG)) {
      return {
        code: ADMIN_ERROR_MAP.INVALID_NAME_TAG.Code,
        message: ADMIN_ERROR_MAP.INVALID_NAME_TAG.Message,
      };
    }

    if (isCreate) {
      // check duplicate address
      const address = await this.privateNameTagRepository.findOne({
        where: { address: req.address },
      });
      if (address) {
        return {
          code: ADMIN_ERROR_MAP.DUPLICATE_ADDRESS.Code,
          message: ADMIN_ERROR_MAP.DUPLICATE_ADDRESS.Message,
        };
      }
    }

    const tag = await this.privateNameTagRepository.findOne({
      where: {
        name_tag: await this.encryptionService.encrypt(req.nameTag),
        address: Not(req.address),
      },
    });

    if (tag) {
      return {
        code: ADMIN_ERROR_MAP.DUPLICATE_TAG.Code,
        message: ADMIN_ERROR_MAP.DUPLICATE_TAG.Message,
      };
    }

    return false;
  }

  async getNameTagMainSite(req: {
    user_id: number;
    limit: number;
    nextKey: number;
  }): Promise<GetPrivateNameTagResult> {
    const nameTags = await this.privateNameTagRepository.getNameTagMainSite(
      Number(req.user_id),
      Number(req.limit),
      Number(req.nextKey),
    );

    const nextKey = nameTags.slice(-1)[0]?.id;
    const data = await Promise.all(
      nameTags.map(async (item) => {
        item.name_tag = await this.encryptionService.decrypt(item.name_tag);
        return item;
      }),
    );

    const result = {
      data: {
        nameTags: data,
        count: Number(nameTags.length),
        nextKey: nextKey || null,
      },
    };

    return result;
  }
}