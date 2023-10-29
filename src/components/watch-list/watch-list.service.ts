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

const ERR_UNIQUE_ADDRESS = 'This address has already been added to watch list.';
const ERR_ADDRESS_NOT_FOUND = 'Address not found.';
const ERR_LIMIT_ADDRESS = `You have reached out of ${
  process.env.LIMITED_PRIVATE_NAME_TAG || 100
} max limitation of address.`;

@Injectable()
export class WatchListService {
  constructor(
    @InjectRepository(WatchList)
    private readonly watchListRepository: Repository<WatchList>,
    private userService: UserService,
    private readonly configService: ConfigService,
  ) {}
  async create(ctx: RequestContext, createWatchListDto: CreateWatchListDto) {
    // Check limit number address
    const totalWatchList = await this.watchListRepository.count({
      where: { user: { id: ctx.user.id } },
    });

    if (totalWatchList >= this.configService.get('watchList.limitAddress')) {
      throw new BadRequestException(ERR_LIMIT_ADDRESS);
    }

    // Check unique
    const duplicateRecord = await this.watchListRepository.findOne({
      where: { address: createWatchListDto.address, user: { id: ctx.user.id } },
    });

    if (duplicateRecord) {
      throw new BadRequestException(ERR_UNIQUE_ADDRESS);
    }

    // Create address
    createWatchListDto.user = await this.userService.findOne({
      where: { id: ctx.user.id },
    });

    return this.watchListRepository.save(createWatchListDto);
  }

  async findAll(ctx: RequestContext) {
    const [watchList, totalRecord] =
      await this.watchListRepository.findAndCount({
        where: { user: { id: ctx.user.id } },
        order: { favorite: 'DESC' },
      });

    const totalTracking = await this.watchListRepository.count({
      where: { user: { id: ctx.user.id }, tracking: true },
    });

    let groupTracking = 0;

    watchList?.forEach((address) => {
      if (address?.settings) {
        groupTracking = groupTracking + this.countTrueValues(address.settings);
      }
    });
    return {
      data: watchList,
      meta: { totalTracking, groupTracking, totalRecord },
    };
  }

  async findOne(ctx: RequestContext, id: number) {
    return this.watchListRepository.findOne({
      where: { id, user: { id: ctx.user.id } },
    });
  }

  async update(
    ctx: RequestContext,
    id: number,
    updateWatchListDto: UpdateWatchListDto,
  ) {
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

      if (duplicateRecord) throw new BadRequestException(ERR_UNIQUE_ADDRESS);
    }

    if (foundedWatchList) {
      updateWatchListDto.id = id;
      await this.watchListRepository.merge(
        foundedWatchList,
        updateWatchListDto,
      );

      return this.watchListRepository.save(foundedWatchList);
    } else {
      throw new NotFoundException(ERR_ADDRESS_NOT_FOUND);
    }
  }

  async remove(ctx: RequestContext, id: number): Promise<DeleteResult> {
    const watchListToDelete = await this.watchListRepository.findOne({
      where: { id: id, user: { id: ctx.user.id } },
    });

    if (!watchListToDelete)
      throw new BadRequestException(ERR_ADDRESS_NOT_FOUND);

    return this.watchListRepository.delete(watchListToDelete.id);
  }

  private countTrueValues(obj) {
    let count = 0;

    function countTrue(obj) {
      for (const key in obj) {
        const value = obj[key];
        if (value === true) {
          count++;
        } else if (typeof value === 'object') {
          if (value.turned === true) {
            countTrue(value);
          }
        }
      }
    }

    countTrue(obj);
    return count;
  }
}
