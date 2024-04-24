import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  ADMIN_ERROR_MAP,
  AkcLogger,
  REGEX_PARTERN,
  RequestContext,
} from '../../../shared';
import { PrivateNameTagParamsDto } from '../dtos/private-name-tag-params.dto';
import { PrivateNameTagRepository } from '../repositories/private-name-tag.repository';
import { CreatePrivateNameTagParamsDto } from '../dtos/create-private-name-tag-params.dto';
import { PrivateNameTag } from '../../../shared/entities/private-name-tag.entity';
import { UpdatePrivateNameTagParamsDto } from '../dtos/update-private-name-tag-params.dto';
import { EncryptionService } from '../../encryption/encryption.service';
import { Not, Repository } from 'typeorm';
import * as appConfig from '../../../shared/configs/configuration';
import { InjectRepository } from '@nestjs/typeorm';
import { Explorer } from '../../../shared/entities/explorer.entity';
import * as util from 'util';
import { VerifyAddressUtil } from '../../../shared/utils/verify-address.util';

@Injectable()
export class PrivateNameTagService {
  private config;

  constructor(
    private readonly logger: AkcLogger,
    private verifyAddressUtil: VerifyAddressUtil,
    private encryptionService: EncryptionService,
    private privateNameTagRepository: PrivateNameTagRepository,
    @InjectRepository(Explorer)
    private explorerRepository: Repository<Explorer>,
  ) {
    this.config = appConfig.default();
  }

  async getNameTags(ctx: RequestContext, req: PrivateNameTagParamsDto) {
    try {
      this.logger.log(ctx, `${this.getNameTags.name} was called!`);

      const { result, count, countFavorite } =
        await this.privateNameTagRepository.getNameTags(
          ctx.user.id,
          req.keyword,
          await this.encryptionService.encrypt(req.keyword ?? ''),
          req.limit,
          req.offset,
          ctx.chainId,
        );
      const data = await Promise.all(
        result.map(async (item) => {
          item.nameTag = await this.encryptionService.decrypt(item.nameTag);
          return item;
        }),
      );

      return { data, count, countFavorite };
    } catch (error) {
      this.logger.error(ctx, error);
      throw new BadRequestException(error.message);
    }
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
    try {
      this.logger.log(ctx, `${this.createNameTag.name} was called!`);
      const explorer = await this.explorerRepository.findOneOrFail({
        chainId: ctx.chainId,
      });
      const errorMsg = await this.validate(0, ctx, req);
      if (errorMsg) {
        return errorMsg;
      }
      const entity = new PrivateNameTag();
      entity.address = req.address;
      entity.evmAddress = req.evmAddress;
      entity.isFavorite = req.isFavorite;
      entity.type = req.type;
      entity.note = req.note;
      entity.nameTag = await this.encryptionService.encrypt(req.nameTag);
      entity.createdBy = ctx.user.id;
      entity.explorer = explorer;

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
    const request: CreatePrivateNameTagParamsDto = {
      ...req,
      address: '',
      evmAddress: '',
    };
    const errorMsg = await this.validate(id, ctx, request, false);
    if (errorMsg) {
      return errorMsg;
    }

    const entity = await this.privateNameTagRepository.findOne(id, {
      where: { createdBy: ctx.user.id },
    });
    if (!entity) {
      throw new NotFoundException('Private Name Tag not found');
    }
    entity.evmAddress = req.evmAddress;
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
    ctx: RequestContext,
    req: CreatePrivateNameTagParamsDto,
    isCreate = true,
  ) {
    const user_id = ctx.user.id;
    const explorer = await this.explorerRepository.findOneOrFail({
      chainId: ctx.chainId,
    });

    if (req.nameTag && !req.nameTag?.match(REGEX_PARTERN.NAME_TAG)) {
      return {
        code: ADMIN_ERROR_MAP.INVALID_NAME_TAG.Code,
        message: ADMIN_ERROR_MAP.INVALID_NAME_TAG.Message,
      };
    }

    if (isCreate) {
      if (!req.address) {
        return {
          code: ADMIN_ERROR_MAP.REQUIRED_ADDRESS.Code,
          message: ADMIN_ERROR_MAP.REQUIRED_ADDRESS.Message,
        };
      }

      const msgErrorVerify = await this.verifyAddressUtil.verify(
        req.address,
        req.evmAddress,
        req.type,
        explorer,
      );
      if (msgErrorVerify) {
        return msgErrorVerify;
      }

      // check limited private name tag
      const count = await this.privateNameTagRepository.count({
        where: { createdBy: user_id, explorer: { id: explorer.id } },
      });

      if (count >= this.config.limitedPrivateNameTag) {
        return {
          code: ADMIN_ERROR_MAP.LIMIT_PRIVATE_NAME_TAG.Code,
          message: ADMIN_ERROR_MAP.LIMIT_PRIVATE_NAME_TAG.Message,
        };
      }

      // check duplicate address
      const entity = await this.privateNameTagRepository.findOne({
        where: {
          createdBy: user_id,
          address: req.address,
        },
      });
      if (entity) {
        return {
          code: ADMIN_ERROR_MAP.DUPLICATE_ADDRESS.Code,
          message: util.format(
            ADMIN_ERROR_MAP.DUPLICATE_ADDRESS.Message,
            'private',
          ),
        };
      }
    }

    // check duplicate private name tag
    const entity = await this.privateNameTagRepository.findOne({
      where: {
        id: Not(id),
        createdBy: user_id,
        nameTag: await this.encryptionService.encrypt(req.nameTag ?? ''),
        explorer: { id: explorer.id },
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
