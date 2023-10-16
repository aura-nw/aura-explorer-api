import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { QUEUES, SharedModule, SyncStatus } from '../../../shared';
import { ServiceUtil } from '../../../shared/utils/service.util';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { NotificationProcessor } from './notification.processor';
import { SyncPointRepository } from '../../sync-point/repositories/sync-point.repository';
import { PrivateNameTagRepository } from '../../private-name-tag/repositories/private-name-tag.repository';
import { PublicNameTagRepository } from '../../public-name-tag/repositories/public-name-tag.repository';
import { NotificationTokenRepository } from './repositories/notification-token.repository';

@Module({
  imports: [
    SharedModule,
    ConfigModule,
    HttpModule,
    TypeOrmModule.forFeature([
      PrivateNameTagRepository,
      PublicNameTagRepository,
      NotificationTokenRepository,
      SyncPointRepository,
      SyncStatus,
    ]),
    BullModule.registerQueueAsync({
      name: QUEUES.NOTIFICATION.QUEUE_NAME,
    }),
  ],
  providers: [NotificationProcessor, ServiceUtil],
  exports: [
    BullModule.registerQueueAsync({
      name: QUEUES.NOTIFICATION.QUEUE_NAME,
    }),
  ],
})
export class NotificationModule {}
