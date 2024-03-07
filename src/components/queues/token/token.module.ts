import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { QUEUES, SharedModule } from '../../../shared';
import { TokenProcessor } from './token.processor';
import { ServiceUtil } from '../../../shared/utils/service.util';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { TokenHolderStatistic } from '../../../shared/entities/token-holder-statistic.entity';
import { AssetsRepository } from '../../asset/repositories/assets.repository';
import { Asset } from 'src/shared/entities/asset.entity';
import { SyncPoint } from 'src/shared/entities/sync-point.entity';
import { TokenMarketsRepository } from 'src/components/cw20-token/repositories/token-markets.repository';

@Module({
  imports: [
    SharedModule,
    ConfigModule,
    HttpModule,
    TypeOrmModule.forFeature([
      TokenMarketsRepository,
      TokenHolderStatistic,
      AssetsRepository,
      Asset,
      SyncPoint,
    ]),
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
