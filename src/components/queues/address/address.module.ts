import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { QUEUES, SharedModule } from '../../../shared';
import { AddressProcessor } from './address.processor';
import { ServiceUtil } from '../../../shared/utils/service.util';
import { ConfigModule } from '@nestjs/config';
import { WatchList } from '../../../shared/entities/watch-list.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PrivateNameTag } from '../../../shared/entities/private-name-tag.entity';
import { PublicNameTag } from '../../../shared/entities/public-name-tag.entity';
import { Explorer } from '../../../shared/entities/explorer.entity';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    SharedModule,
    ConfigModule,
    HttpModule,
    TypeOrmModule.forFeature([
      PrivateNameTag,
      PublicNameTag,
      WatchList,
      Explorer,
    ]),
    BullModule.registerQueueAsync({
      name: QUEUES.ADDRESS.QUEUE_NAME,
    }),
  ],
  providers: [AddressProcessor, ServiceUtil],
  exports: [
    BullModule.registerQueueAsync({
      name: QUEUES.ADDRESS.QUEUE_NAME,
    }),
  ],
})
export class AddressModule {}
