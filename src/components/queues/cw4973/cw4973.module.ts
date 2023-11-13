import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { AkcLoggerModule, QUEUES, SyncStatus } from '../../../shared';
import { CW4973Processor } from './cw4973.processor';
import { ServiceUtil } from '../../../shared/utils/service.util';
import { HttpModule } from '@nestjs/axios';
import { SoulboundTokenRepository } from '../../soulbound-token/repositories/soulbound-token.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SyncPointRepository } from '../../sync-point/repositories/sync-point.repository';

@Module({
  imports: [
    BullModule.registerQueueAsync({
      name: QUEUES.CW4973.QUEUE_NAME,
    }),
    TypeOrmModule.forFeature([
      SoulboundTokenRepository,
      SyncPointRepository,
      SyncStatus,
    ]),
    AkcLoggerModule,
    HttpModule,
  ],
  providers: [CW4973Processor, ServiceUtil],
  exports: [
    BullModule.registerQueueAsync({
      name: QUEUES.SEND_MAIL.QUEUE_NAME,
    }),
  ],
})
export class CW4973QueueModule {}
