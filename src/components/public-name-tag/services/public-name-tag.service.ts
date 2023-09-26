import { Injectable } from '@nestjs/common';
import {
  ADMIN_ERROR_MAP,
  AkcLogger,
  REGEX_PARTERN,
  RequestContext,
} from '../../../shared';
import { PublicNameTagParamsDto } from '../dtos/public-name-tag-params.dto';
import { PublicNameTagRepository } from '../repositories/public-name-tag.repository';
import { StorePublicNameTagParamsDto } from '../dtos/store-public-name-tag-params.dto';
import { PublicNameTag } from '../../../shared/entities/public-name-tag.entity';
import { GetPublicNameTagResult } from '../dtos/get-public-name-tag-result.dto';
import { Not } from 'typeorm';
import { ServiceUtil } from '../../../shared/utils/service.util';
import { UpdatePublicNameTagParamsDto } from '../dtos/update-public-name-tag-params.dto';

@Injectable()
export class PublicNameTagService {
  constructor(
    private readonly logger: AkcLogger,
    private nameTagRepository: PublicNameTagRepository,
    private serviceUtil: ServiceUtil,
  ) {}

  async getPublicNameTags(ctx: RequestContext, req: PublicNameTagParamsDto) {
    this.logger.log(ctx, `${this.getPublicNameTags.name} was called!`);
    const { result, count } = await this.nameTagRepository.getPublicNameTags(
      req.keyword,
      req.limit,
      req.offset,
    );

    return { result, count };
  }

  async getPublicNameTagsDetail(ctx: RequestContext, id: number) {
    this.logger.log(ctx, `${this.getPublicNameTagsDetail.name} was called!`);
    return await this.nameTagRepository.findOne(id);
  }

  async createPublicNameTag(
    ctx: RequestContext,
    userId: number,
    req: StorePublicNameTagParamsDto,
  ) {
    this.logger.log(ctx, `${this.createPublicNameTag.name} was called!`);
    const errorMsg = await this.validate(req);
    if (errorMsg) {
      return errorMsg;
    }
    const entity = new PublicNameTag();
    entity.address = req.address;
    entity.type = req.type;
    entity.name_tag = req.nameTag;
    entity.updated_by = userId;
    entity.enterpriseUrl = req.enterpriseUrl;
    try {
      const result = await this.nameTagRepository.save(entity);
      return { data: result, meta: {} };
    } catch (err) {
      this.logger.error(
        ctx,
        `Class ${PublicNameTagService.name} call ${this.createPublicNameTag.name} error ${err?.code} method error: ${err?.stack}`,
      );
    }
  }

  async updatePublicNameTag(
    ctx: RequestContext,
    userId: number,
    req: UpdatePublicNameTagParamsDto,
  ) {
    this.logger.log(ctx, `${this.updatePublicNameTag.name} was called!`);
    const errorMsg = await this.validate(req, false);
    if (errorMsg) {
      return errorMsg;
    }
    const entity = new PublicNameTag();
    entity.name_tag = req.nameTag;
    entity.updated_by = userId;
    entity.enterpriseUrl = req.enterpriseUrl;
    try {
      const result = await this.nameTagRepository.update(req.id, entity);
      return { data: result, meta: {} };
    } catch (err) {
      this.logger.error(
        ctx,
        `Class ${PublicNameTagService.name} call ${this.updatePublicNameTag.name} error ${err?.code} method error: ${err?.stack}`,
      );
    }
  }

  async deletePublicNameTag(ctx: RequestContext, id: number) {
    this.logger.log(ctx, `${this.deletePublicNameTag.name} was called!`);
    try {
      return await this.nameTagRepository.delete(id);
    } catch (err) {
      this.logger.error(
        ctx,
        `Class ${PublicNameTagService.name} call ${this.deletePublicNameTag.name} error ${err?.code} method error: ${err?.stack}`,
      );
    }
  }

  private async validate(req: any, isCreate = true) {
    if (!req.nameTag.match(REGEX_PARTERN.NAME_TAG)) {
      return {
        code: ADMIN_ERROR_MAP.INVALID_NAME_TAG.Code,
        message: ADMIN_ERROR_MAP.INVALID_NAME_TAG.Message,
      };
    }

    if (req?.enterpriseUrl && !req.enterpriseUrl.match(REGEX_PARTERN.URL)) {
      return {
        code: ADMIN_ERROR_MAP.INVALID_URL.Code,
        message: ADMIN_ERROR_MAP.INVALID_URL.Message,
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
      where: {
        name_tag: req.nameTag,
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
    limit: number;
    nextKey: number;
  }): Promise<GetPublicNameTagResult> {
    const nameTags = await this.nameTagRepository.getNameTagMainSite(
      Number(req.limit),
      Number(req.nextKey),
    );

    const nextKey = nameTags.slice(-1)[0]?.id;

    const data = {
      data: {
        nameTags: nameTags,
        count: Number(nameTags.length),
        nextKey: nextKey || null,
      },
    };

    return data;
  }
}
