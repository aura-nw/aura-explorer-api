import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { QUEUES, SharedModule } from '../../../shared';
import { TokenProcessor } from './token.processor';
import { ServiceUtil } from '../../../shared/utils/service.util';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TokenMarketsRepository } from '../../cw20-token/repositories/token-markets.repository';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    SharedModule,
    ConfigModule,
    HttpModule,
    TypeOrmModule.forFeature([TokenMarketsRepository]),
    BullModule.registerQueueAsync({
      name: QUEUES.TOKEN.QUEUE_NAME,
    }),
  ],
  providers: [TokenProcessor, ServiceUtil],
  exports: [
    BullModule.registerQueueAsync({
      name: QUEUES.TOKEN.QUEUE_NAME,
    }),
  ],
})
export class TokenModule {}
