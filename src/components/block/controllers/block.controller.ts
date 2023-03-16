import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { AkcLogger } from '../../../shared';

import { BlockService } from '../services/block.service';

@ApiTags('blocks')
@Controller('blocks')
export class BlockController {
  constructor(
    private readonly blockService: BlockService,
    private readonly logger: AkcLogger,
  ) {
    this.logger.setContext(BlockController.name);
  }
}
