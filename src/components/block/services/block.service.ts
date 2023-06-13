import { Injectable } from '@nestjs/common';

import { AkcLogger } from '../../../shared';

@Injectable()
export class BlockService {
  constructor(private readonly logger: AkcLogger) {
    this.logger.setContext(BlockService.name);
  }
}
