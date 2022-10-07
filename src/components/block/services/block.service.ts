import { Injectable } from '@nestjs/common';
import { plainToClass } from 'class-transformer';

import { AkcLogger, RequestContext } from '../../../shared';

import { BlockParamsDto } from '../dtos/block-params.dto';
import { BlockRepository } from '../repositories/block.repository';

import { BlockLatestDto } from '../dtos/block-latest-params.dto';
import { LiteBlockOutput } from '../dtos/lite-block-output.dto';

@Injectable()
export class BlockService {
  constructor(
    private readonly logger: AkcLogger,
    private blockRepository: BlockRepository,
  ) {
    this.logger.setContext(BlockService.name);
  }

  async getTotalBlock(): Promise<number> {
    return await this.blockRepository.count();
  }

  async getDataBlocks(
    ctx: RequestContext,
    limit: number,
    offset: number,
  ): Promise<{ blocks: LiteBlockOutput[]; count: number }> {
    this.logger.log(ctx, `${this.getDataBlocks.name} was called!`);

    const [blocks, count] = await this.blockRepository.findAndCount({
      order: { height: 'DESC' },
      take: limit,
      skip: offset,
    });

    const blocksOutput = plainToClass(LiteBlockOutput, blocks, {
      excludeExtraneousValues: true,
    });

    return { blocks: blocksOutput, count };
  }

  async getBlockLatest(
    ctx: RequestContext,
    query: BlockParamsDto,
  ): Promise<{ blocks: LiteBlockOutput[]; count: number }> {
    this.logger.log(ctx, `${this.getBlockLatest.name} was called!`);
    query.limit = 100;

    const [blocks, count] = await this.blockRepository.findAndCount({
      order: { height: 'DESC' },
      take: query.limit,
      skip: query.offset,
    });

    const blocksOutput = plainToClass(LiteBlockOutput, blocks, {
      excludeExtraneousValues: true,
    });

    return { blocks: blocksOutput, count };
  }

  async getTopBlocks(
    ctx: RequestContext,
    query: BlockLatestDto,
  ): Promise<{ blocks: LiteBlockOutput[]}> {
    this.logger.log(ctx, `${this.getTopBlocks.name} was called!`);

    const blocks = await this.blockRepository.find({
      order: { height: 'DESC' },
      take: query.limit,
    });

    const blocksOutput = plainToClass(LiteBlockOutput, blocks, {
      excludeExtraneousValues: true,
    });

    return { blocks: blocksOutput};
  }
}
