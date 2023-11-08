import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateWatchListDto } from './dto/create-watch-list.dto';
import { UpdateWatchListDto } from './dto/update-watch-list.dto';
import { RequestContext } from '../../shared/request-context/request-context.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm/repository/Repository';
import { WatchList } from '../../shared/entities/watch-list.entity';
import { UserService } from '../user/user.service';
import { DeleteResult } from 'typeorm/query-builder/result/DeleteResult';
import { In, Not } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { BaseApiResponse, WATCH_LIST } from '../../shared/';
import { WatchListDetailResponse } from './dto/watch-list-detail.response';
import { isValidBench32Address } from 'src/shared/utils/service.util';
import { PublicNameTag } from '../../shared/entities/public-name-tag.entity';
import { EncryptionService } from '../encryption/encryption.service';
import { PrivateNameTag } from '../../shared/entities/private-name-tag.entity';

@Injectable()
export class WatchListService {
  constructor(
    @InjectRepository(WatchList)
    private readonly watchListRepository: Repository<WatchList>,
    @InjectRepository(PublicNameTag)
    private readonly publicNameTagRepository: Repository<PublicNameTag>,
    @InjectRepository(PrivateNameTag)
    private readonly privateNameTagRepository: Repository<PrivateNameTag>,
    private userService: UserService,
    private readonly encryptionService: EncryptionService,
    private readonly configService: ConfigService,
  ) {}
  async create(
    ctx: RequestContext,
    createWatchListDto: CreateWatchListDto,
  ): Promise<WatchList> {
    // Check limit number address
    const totalWatchList = await this.watchListRepository.count({
      where: { user: { id: ctx.user.id } },
    });

    if (totalWatchList >= this.configService.get('watchList.limitAddress')) {
      throw new BadRequestException(WATCH_LIST.ERROR_MSGS.ERR_LIMIT_ADDRESS);
    }

    // Check unique
    const duplicateRecord = await this.watchListRepository.findOne({
      where: { address: createWatchListDto.address, user: { id: ctx.user.id } },
    });

    if (duplicateRecord) {
      throw new BadRequestException(WATCH_LIST.ERROR_MSGS.ERR_UNIQUE_ADDRESS);
    }

    // Create address
    createWatchListDto.user = await this.userService.findOne({
      where: { id: ctx.user.id },
    });

    return this.watchListRepository.save(createWatchListDto);
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
  ): Promise<WatchList> {
    const foundedWatchList = await this.watchListRepository.findOne({
      where: {
        id,
        user: { id: ctx.user.id },
      },
    });

    // Check duplicate when update address
    if (updateWatchListDto.address) {
      const duplicateRecord = await this.watchListRepository.findOne({
        where: {
          id: Not(id),
          address: updateWatchListDto.address,
          user: { id: ctx.user.id },
        },
      });

      if (duplicateRecord)
        throw new BadRequestException(WATCH_LIST.ERROR_MSGS.ERR_UNIQUE_ADDRESS);
    }

    if (foundedWatchList) {
      updateWatchListDto.id = id;
      await this.watchListRepository.merge(
        foundedWatchList,
        updateWatchListDto,
      );

      return this.watchListRepository.save(foundedWatchList);
    } else {
      throw new NotFoundException(WATCH_LIST.ERROR_MSGS.ERR_ADDRESS_NOT_FOUND);
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
    if (await isValidBench32Address(keyword)) {
      // Find in watch list.
      let foundedPublicNameTag = null;
      let foundPrivateNameTag = null;

      const foundedWatchList = (await this.watchListRepository.findOne({
        where: { address: keyword, user: { id: ctx.user.id } },
      })) as any as WatchListDetailResponse;

      if (foundedWatchList) {
        // Find in public tag.
        foundedPublicNameTag = await this.publicNameTagRepository.findOne({
          where: { address: keyword },
        });

        // Find in private tag.
        foundPrivateNameTag = await this.privateNameTagRepository.findOne({
          where: { address: keyword, createdBy: ctx.user.id },
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
        where: { name_tag: keyword },
      });

      const foundedPrivateNameTag = await this.privateNameTagRepository.findOne(
        {
          where: { createdBy: ctx.user.id, nameTag: keywordEncrypted },
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
