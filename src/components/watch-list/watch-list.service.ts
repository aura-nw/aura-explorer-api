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
import { Not } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { BaseApiResponse, WATCH_LIST } from '../../shared/';
import { WatchListDetailResponse } from './dto/watch-list-detail.response';

@Injectable()
export class WatchListService {
  constructor(
    @InjectRepository(WatchList)
    private readonly watchListRepository: Repository<WatchList>,
    private userService: UserService,
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
  ): Promise<BaseApiResponse<WatchListDetailResponse[]>> {
    const watchList = (await this.watchListRepository.find({
      where: { user: { id: ctx.user.id } },
      order: { favorite: 'DESC' },
    })) as any as WatchListDetailResponse[];

    watchList?.forEach((address) => {
      address.groupTracking = this.countTrueValues(address.settings);
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
