import { Module } from '@nestjs/common';

import { AkcLogger } from './logger.service';

@Module({
  imports: [],
  providers: [AkcLogger],
  exports: [AkcLogger],
})
export class AkcLoggerModule {}
