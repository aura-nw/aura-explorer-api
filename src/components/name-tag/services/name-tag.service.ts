import { Injectable } from '@nestjs/common';
import {
  ADMIN_ERROR_MAP,
  AURA_INFO,
  AkcLogger,
  LENGTH,
  RequestContext,
} from '../../../shared';
import { NameTagParamsDto } from '../dtos/name-tag-params.dto';
import { NameTagRepository } from '../repositories/name-tag.repository';
import { StoreNameTagParamsDto } from '../dtos/store-name-tag-params.dto';
import { NameTag } from '../../../shared/entities/name-tag.entity';
import { Timestamp } from 'typeorm';

@Injectable()
export class NameTagService {
  constructor(
    private readonly logger: AkcLogger,
    private nameTagRepository: NameTagRepository,
  ) {}

  async getNameTags(ctx: RequestContext, req: NameTagParamsDto) {
    this.logger.log(ctx, `${this.getNameTags.name} was called!`);
    const { result, count } = await this.nameTagRepository.getNameTags(
      req.keyword,
      req.limit,
      req.offset,
    );

    return { result, count };
  }

  async createNameTag(ctx: RequestContext, req: StoreNameTagParamsDto) {
    this.logger.log(ctx, `${this.createNameTag.name} was called!`);
    const errorMsg = await this.validate(req);
    if (errorMsg) {
      return errorMsg;
    }
    const entity = new NameTag();
    entity.address = req.address;
    entity.type = req.type;
    entity.name_tag = req.nameTag;
    entity.updated_by = req.userId;
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

  async updateNameTag(ctx: RequestContext, req: StoreNameTagParamsDto) {
    this.logger.log(ctx, `${this.updateNameTag.name} was called!`);
    const errorMsg = await this.validate(req, false);
    if (errorMsg) {
      return errorMsg;
    }
    const entity = new NameTag();
    entity.address = req.address;
    entity.type = req.type;
    entity.name_tag = req.nameTag;
    entity.updated_by = req.userId;
    try {
      const result = await this.nameTagRepository.update(req.id, entity);
      return { data: result, meta: {} };
    } catch (err) {
      this.logger.error(
        ctx,
        `Class ${NameTagService.name} call ${this.updateNameTag.name} error ${err?.code} method error: ${err?.stack}`,
      );
    }
  }

  async deleteNameTag(ctx: RequestContext, id: number) {
    this.logger.log(ctx, `${this.updateNameTag.name} was called!`);
    try {
      return await this.nameTagRepository.softDelete(id);
    } catch (err) {
      this.logger.error(
        ctx,
        `Class ${NameTagService.name} call ${this.updateNameTag.name} error ${err?.code} method error: ${err?.stack}`,
      );
    }
  }

  private async validate(req: StoreNameTagParamsDto, isCreate = true) {
    const validFormat =
      req.address.startsWith(AURA_INFO.CONTRACT_ADDRESS) &&
      (req.address.length === LENGTH.CONTRACT_ADDRESS ||
        req.address.length === LENGTH.ACCOUNT_ADDRESS);

    if (!validFormat) {
      return {
        code: ADMIN_ERROR_MAP.INVALID_FORMAT.Code,
        message: ADMIN_ERROR_MAP.INVALID_FORMAT.Message,
      };
    }

    if (isCreate) {
      // check duplicate address
      const address = await this.nameTagRepository.findOne({
        where: { address: req.address },
      });
      if (address) {
        return {
          code: ADMIN_ERROR_MAP.DUPLICATE_ADDRESS.Code,
          message: ADMIN_ERROR_MAP.DUPLICATE_ADDRESS.Message,
        };
      }
    }

    const tag = await this.nameTagRepository.findOne({
      where: { name_tag: req.nameTag },
    });

    if (tag) {
      return {
        code: ADMIN_ERROR_MAP.DUPLICATE_TAG.Code,
        message: ADMIN_ERROR_MAP.DUPLICATE_TAG.Message,
      };
    }

    return false;
  }
}
