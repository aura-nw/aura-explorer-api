import { Injectable } from '@nestjs/common';
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
import { StorePrivateNameTagParamsDto } from '../dtos/store-private-name-tag-params.dto';
import { NameTag } from '../../../shared/entities/name-tag.entity';
import { GetPrivateNameTagDto } from '../dtos/get-private-name-tag.dto';
import { GetPrivateNameTagResult } from '../dtos/get-private-name-tag-result.dto';
import { Not } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { KMS } from 'aws-sdk';

@Injectable()
export class PrivateNameTagService {
  private kms: KMS;
  constructor(
    private readonly logger: AkcLogger,
    private configService: ConfigService,
    private nameTagRepository: PrivateNameTagRepository,
  ) {
    this.kms = new KMS({
      accessKeyId: this.configService.get<string>('kms.accessKeyId'),
      secretAccessKey: this.configService.get<string>('kms.secretAccessKey'),
      region: this.configService.get<string>('kms.region'),
    });
  }

  async getNameTags(ctx: RequestContext, req: PrivateNameTagParamsDto) {
    this.logger.log(ctx, `${this.getNameTags.name} was called!`);
    const { result, count } = await this.nameTagRepository.getNameTags(
      req.keyword,
      req.limit,
      req.offset,
    );

    return { result, count };
  }

  async getNameTagsDetail(ctx: RequestContext, id: number) {
    this.logger.log(ctx, `${this.getNameTags.name} was called!`);
    return await this.nameTagRepository.findOne(id);
  }

  async createNameTag(ctx: RequestContext, req: StorePrivateNameTagParamsDto) {
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
        `Class ${PrivateNameTagService.name} call ${this.createNameTag.name} error ${err?.code} method error: ${err?.stack}`,
      );
    }
  }

  async updateNameTag(ctx: RequestContext, req: StorePrivateNameTagParamsDto) {
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
        `Class ${PrivateNameTagService.name} call ${this.updateNameTag.name} error ${err?.code} method error: ${err?.stack}`,
      );
    }
  }

  async deleteNameTag(ctx: RequestContext, id: number) {
    this.logger.log(ctx, `${this.updateNameTag.name} was called!`);
    try {
      return await this.nameTagRepository.delete(id);
    } catch (err) {
      this.logger.error(
        ctx,
        `Class ${PrivateNameTagService.name} call ${this.updateNameTag.name} error ${err?.code} method error: ${err?.stack}`,
      );
    }
  }

  private async validate(req: StorePrivateNameTagParamsDto, isCreate = true) {
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
    if (!req.nameTag.match(REGEX_PARTERN.NAME_TAG)) {
      return {
        code: ADMIN_ERROR_MAP.INVALID_NAME_TAG.Code,
        message: ADMIN_ERROR_MAP.INVALID_NAME_TAG.Message,
      };
    }

    if (isCreate) {
      // check duplicate address
      const address = await this.nameTagRepository.findOne({
        where: { address: req.address, deleted_at: null },
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
        deleted_at: null,
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

  async getNameTag(
    req: GetPrivateNameTagDto,
  ): Promise<GetPrivateNameTagResult> {
    const nameTags = await this.nameTagRepository.getNameTag(
      req.keyword,
      Number(req.limit),
      Number(req.nextKey),
    );

    let nextKey;

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

  // source is plain text
  async encrypt(source: string) {
    const params = {
      KeyId: this.configService.get<string>('accessKeyId'),
      Plaintext: source,
    };
    const { CiphertextBlob } = await this.kms.encrypt(params).promise();

    // store encrypted data as base64 encoded string
    return CiphertextBlob.toString('base64');
  }

  // source is cipher text
  async decrypt(source: string) {
    const params = {
      CiphertextBlob: Buffer.from(source, 'base64'),
    };
    const { Plaintext } = await this.kms.decrypt(params).promise();
    return Plaintext.toString();
  }
}
