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
}
