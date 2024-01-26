import { BadRequestException, Injectable } from '@nestjs/common';
import {
  ADMIN_ERROR_MAP,
  AkcLogger,
  LENGTH,
  NAME_TAG_TYPE,
  REGEX_PARTERN,
  RequestContext,
} from '../../../shared';
import { PublicNameTagParamsDto } from '../dtos/public-name-tag-params.dto';
import { PublicNameTagRepository } from '../repositories/public-name-tag.repository';
import { StorePublicNameTagParamsDto } from '../dtos/store-public-name-tag-params.dto';
import { PublicNameTag } from '../../../shared/entities/public-name-tag.entity';
import { GetPublicNameTagResult } from '../dtos/get-public-name-tag-result.dto';
import { Not, Repository } from 'typeorm';
import { isValidBench32Address } from '../../../shared/utils/service.util';
import { UpdatePublicNameTagParamsDto } from '../dtos/update-public-name-tag-params.dto';
import { Explorer } from '../../../shared/entities/explorer.entity';
import { InjectRepository } from '@nestjs/typeorm';
import * as util from 'util';

@Injectable()
export class PublicNameTagService {
  constructor(
    private readonly logger: AkcLogger,
    private nameTagRepository: PublicNameTagRepository,
    @InjectRepository(Explorer)
    private explorerRepository: Repository<Explorer>,
  ) {}

  async getPublicNameTags(ctx: RequestContext, req: PublicNameTagParamsDto) {
    this.logger.log(ctx, `${this.getPublicNameTags.name} was called!`);
    try {
      const explorer = await this.explorerRepository.findOneOrFail({
        chainId: ctx.chainId,
      });
      const { result, count } = await this.nameTagRepository.getPublicNameTags(
        req.keyword,
        req.limit,
        req.offset,
        explorer.id,
      );

      return { result, count };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
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
    const errorMsg = await this.validate(ctx, req);
    if (errorMsg) {
      return errorMsg;
    }

    try {
      const explorer = await this.explorerRepository.findOneOrFail({
        chainId: ctx.chainId,
      });

      const entity = new PublicNameTag();
      entity.address = req.address;
      entity.type = req.type;
      entity.name_tag = req.nameTag;
      entity.updated_by = userId;
      entity.enterpriseUrl = req.enterpriseUrl;
      entity.explorer = explorer;

      const result = await this.nameTagRepository.save(entity);
      return { data: result, meta: {} };
    } catch (err) {
      this.logger.error(
        ctx,
        `Class ${PublicNameTagService.name} call ${this.createPublicNameTag.name} error ${err?.code} method error: ${err?.stack}`,
      );
      throw new BadRequestException(err.message);
    }
  }

  async updatePublicNameTag(
    ctx: RequestContext,
    userId: number,
    req: UpdatePublicNameTagParamsDto,
  ) {
    this.logger.log(ctx, `${this.updatePublicNameTag.name} was called!`);
    const errorMsg = await this.validate(ctx, req, false);
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
      throw new BadRequestException(err.message);
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

  private async validate(ctx: any, req: any, isCreate = true) {
    const explorer = await this.explorerRepository.findOne({
      chainId: ctx.chainId,
    });

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
      const validFormat = await isValidBench32Address(
        req.address,
        explorer?.addressPrefix,
      );

      if (
        !validFormat ||
        (req.address.length === LENGTH.CONTRACT_ADDRESS &&
          req.type !== NAME_TAG_TYPE.CONTRACT) ||
        (req.address.length === LENGTH.ACCOUNT_ADDRESS &&
          req.type !== NAME_TAG_TYPE.ACCOUNT)
      ) {
        return {
          code: ADMIN_ERROR_MAP.INVALID_FORMAT.Code,
          message: util.format(
            ADMIN_ERROR_MAP.INVALID_FORMAT.Message,
            explorer.addressPrefix,
          ),
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
        explorer: { id: explorer.id },
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
    chainId: string;
  }): Promise<GetPublicNameTagResult> {
    const nameTags = await this.nameTagRepository.getNameTagMainSite(
      Number(req.limit),
      Number(req.nextKey),
      req.chainId,
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
