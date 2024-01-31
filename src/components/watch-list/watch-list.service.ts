import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateWatchListDto } from './dto/create-watch-list.dto';
import { UpdateWatchListDto } from './dto/update-watch-list.dto';
import { RequestContext } from '../../shared/request-context/request-context.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm/repository/Repository';
import { WatchList } from '../../shared/entities/watch-list.entity';
import { UserService } from '../user/user.service';
import { DeleteResult } from 'typeorm/query-builder/result/DeleteResult';
import { EntityNotFoundError, In } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import {
  AkcLogger,
  BaseApiResponse,
  TYPE_ORM_ERROR_CODE,
  WATCH_LIST,
} from '../../shared/';
import { WatchListDetailResponse } from './dto/watch-list-detail.response';
import { isValidBench32Address } from 'src/shared/utils/service.util';
import { PublicNameTag } from '../../shared/entities/public-name-tag.entity';
import { EncryptionService } from '../encryption/encryption.service';
import { PrivateNameTag } from '../../shared/entities/private-name-tag.entity';
import { Explorer } from 'src/shared/entities/explorer.entity';
import { plainToClass } from 'class-transformer';
import { User } from 'src/shared/entities/user.entity';
import * as util from 'util';

@Injectable()
export class WatchListService {
  constructor(
    @InjectRepository(WatchList)
    private readonly watchListRepository: Repository<WatchList>,
    @InjectRepository(PublicNameTag)
    private readonly publicNameTagRepository: Repository<PublicNameTag>,
    @InjectRepository(PrivateNameTag)
    private readonly privateNameTagRepository: Repository<PrivateNameTag>,
    @InjectRepository(Explorer)
    private readonly explorerRepository: Repository<Explorer>,
    private userService: UserService,
    private readonly encryptionService: EncryptionService,
    private readonly configService: ConfigService,
    private readonly logger: AkcLogger,
  ) {}
  async create(
    ctx: RequestContext,
    createWatchListDto: CreateWatchListDto,
  ): Promise<WatchListDetailResponse> {
    try {
      const explorer = await this.explorerRepository.findOneOrFail({
        chainId: ctx.chainId,
      });

      // validate
      if (
        !(await isValidBench32Address(
          createWatchListDto.address,
          explorer.addressPrefix,
        ))
      ) {
        throw new BadRequestException(
          util.format(
            WATCH_LIST.ERROR_MSGS.ERR_INVALID_ADDRESS,
            explorer.addressPrefix,
          ),
        );
      }

      // Check limit number address
      const totalWatchList = await this.watchListRepository.count({
        where: { user: { id: ctx.user.id }, explorer: { id: explorer.id } },
      });

      if (totalWatchList >= this.configService.get('watchList.limitAddress')) {
        throw new BadRequestException(WATCH_LIST.ERROR_MSGS.ERR_LIMIT_ADDRESS);
      }

      createWatchListDto.explorer = explorer;
      createWatchListDto.user = { id: ctx.user.id } as User;

      const newWatchList = await this.watchListRepository.save(
        createWatchListDto,
      );

      return plainToClass(WatchListDetailResponse, newWatchList);
    } catch (error) {
      if (error instanceof EntityNotFoundError) {
        throw new BadRequestException(error.message);
      } else if (
        error?.driverError?.code === TYPE_ORM_ERROR_CODE.ER_DUP_ENTRY
      ) {
        throw new BadRequestException(WATCH_LIST.ERROR_MSGS.ERR_UNIQUE_ADDRESS);
      }

      throw error;
    }
  }

  async findAll(
    ctx: RequestContext,
    keyword: string,
  ): Promise<BaseApiResponse<WatchListDetailResponse[]>> {
    // Filter by keyword
    if (keyword) {
      return await this.filterWatchList(ctx, keyword);
    }

    const watchList = (await this.watchListRepository.find({
      where: { user: { id: ctx.user.id } },
      order: { favorite: 'DESC', updated_at: 'DESC' },
    })) as any as WatchListDetailResponse[];

    // Mapping name tag.
    const addresses = watchList?.map((addr) => addr.address);

    const publicNameTags = await this.publicNameTagRepository.find({
      where: { address: In(addresses) },
    });

    const privateNameTags = await this.privateNameTagRepository.find({
      where: { address: In(addresses), createdBy: ctx.user.id },
    });

    const decodedPrivateTags = await Promise.all(
      privateNameTags.map(async (privateNameTag) => {
        privateNameTag.nameTag = await this.encryptionService.decrypt(
          privateNameTag.nameTag,
        );

        return privateNameTag;
      }),
    );

    watchList?.forEach((address) => {
      address.groupTracking = this.countTrueValues(address.settings);
      address.publicNameTag =
        publicNameTags?.find(
          (publicTag) => publicTag.address === address.address,
        )?.name_tag || null;

      address.privateNameTag =
        decodedPrivateTags?.find(
          (privateTag) => privateTag.address === address.address,
        )?.nameTag || null;
    });

    return {
      data: watchList,
      meta: { count: watchList.length },
    };
  }

  async findOne(ctx: RequestContext, id: number): Promise<WatchList> {
    return this.watchListRepository.findOne({
      where: { id, user: { id: ctx.user.id } },
    });
  }

  async update(
    ctx: RequestContext,
    id: number,
    updateWatchListDto: UpdateWatchListDto,
  ): Promise<WatchListDetailResponse> {
    try {
      const explorer = await this.explorerRepository.findOneOrFail({
        chainId: ctx.chainId,
      });

      await this.watchListRepository.findOneOrFail({
        where: {
          id: id,
          user: { id: ctx.user.id },
          explorer: { id: explorer.id },
        },
      });

      updateWatchListDto.id = id;
      updateWatchListDto.user = { id: ctx.user.id } as User;
      updateWatchListDto.explorer = explorer;

      const updatedWatchList = await this.watchListRepository.save(
        updateWatchListDto,
      );

      return plainToClass(WatchListDetailResponse, updatedWatchList);
    } catch (error) {
      if (error?.driverError?.code === TYPE_ORM_ERROR_CODE.ER_DUP_ENTRY) {
        throw new BadRequestException(WATCH_LIST.ERROR_MSGS.ERR_UNIQUE_ADDRESS);
      } else if (error instanceof EntityNotFoundError) {
        throw new BadRequestException(
          WATCH_LIST.ERROR_MSGS.ERR_ADDRESS_NOT_FOUND,
        );
      }

      throw error;
    }
  }

  async remove(ctx: RequestContext, id: number): Promise<DeleteResult> {
    const watchListToDelete = await this.watchListRepository.findOne({
      where: { id: id, user: { id: ctx.user.id } },
    });

    if (!watchListToDelete)
      throw new BadRequestException(
        WATCH_LIST.ERROR_MSGS.ERR_ADDRESS_NOT_FOUND,
      );

    return this.watchListRepository.delete(watchListToDelete.id);
  }

  private async filterWatchList(
    ctx: RequestContext,
    keyword: string,
  ): Promise<BaseApiResponse<WatchListDetailResponse[]>> {
    const explorer = await this.explorerRepository.findOneOrFail({
      chainId: ctx.chainId,
    });

    const explorerId = explorer.id;

    if (await isValidBench32Address(keyword, explorer.addressPrefix)) {
      // Find in watch list.
      let foundedPublicNameTag = null;
      let foundPrivateNameTag = null;

      const foundedWatchList = (await this.watchListRepository.findOne({
        where: { address: keyword, user: { id: ctx.user.id } },
      })) as any as WatchListDetailResponse;

      if (foundedWatchList) {
        // Find in public tag.
        foundedPublicNameTag = await this.publicNameTagRepository.findOne({
          where: { address: keyword, explorer: { id: explorerId } },
        });

        // Find in private tag.
        foundPrivateNameTag = await this.privateNameTagRepository.findOne({
          where: {
            address: keyword,
            createdBy: ctx.user.id,
            explorer: { id: explorerId },
          },
        });

        // Mapping tags.
        foundedWatchList.publicNameTag = foundedPublicNameTag?.name_tag || null;
        foundedWatchList.privateNameTag = foundPrivateNameTag
          ? await this.encryptionService.decrypt(foundPrivateNameTag.nameTag)
          : null;

        // Calculate group tracking
        foundedWatchList.groupTracking = this.countTrueValues(
          foundedWatchList.settings,
        );
      }

      return {
        data: [foundedWatchList],
        meta: { count: foundedWatchList ? 1 : 0 },
      };
    } else {
      const keywordEncrypted = await this.encryptionService.encrypt(keyword);

      const foundedPublicNameTag = await this.publicNameTagRepository.findOne({
        where: { name_tag: keyword, explorer: { id: explorerId } },
      });

      const foundedPrivateNameTag = await this.privateNameTagRepository.findOne(
        {
          where: {
            createdBy: ctx.user.id,
            nameTag: keywordEncrypted,
            explorer: { id: explorerId },
          },
        },
      );

      // Filter watch list by name tags.
      const foundedWatchList = (await this.watchListRepository.find({
        where: {
          address: In([
            foundedPublicNameTag?.address,
            foundedPrivateNameTag?.address,
          ]),
          user: { id: ctx.user.id },
          explorer: { id: explorerId },
        },
        order: { favorite: 'DESC', updated_at: 'DESC' },
      })) as any as WatchListDetailResponse[];

      // Mapping name tags
      foundedWatchList?.forEach(async (address) => {
        if (address.address === foundedPublicNameTag?.address) {
          address.publicNameTag = foundedPublicNameTag.name_tag;
        } else {
          address.publicNameTag = null;
        }

        if (address.address === foundedPrivateNameTag?.address) {
          address.privateNameTag = await this.encryptionService.decrypt(
            foundedPrivateNameTag.nameTag,
          );
        } else {
          address.privateNameTag = null;
        }

        // Calculate group tracking.
        address.groupTracking = this.countTrueValues(address.settings);
      });

      return {
        data: foundedWatchList,
        meta: { count: foundedWatchList.length },
      };
    }
  }

  private countTrueValues(obj): number {
    let count = 0;

    function countTrue(obj) {
      for (const key in obj) {
        // Don't count inactiveAutoRestake.
        if (key === 'inactiveAutoRestake') continue;

        const value = obj[key];

        if (value === true) {
          count++;
        } else if (typeof value === 'object') {
          // Recursively count if value is an object.
          // Only count if turned is true.
          if (value?.turnOn === true) {
            countTrue(value);
          }
        }
      }
    }

    countTrue(obj);

    return count;
  }
}
