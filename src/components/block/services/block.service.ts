import { Injectable } from '@nestjs/common';
import { plainToClass } from 'class-transformer';

import { AkcLogger, RequestContext } from '../../../shared';

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
