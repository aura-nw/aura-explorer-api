import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { QUEUES, SharedModule } from '../../../shared';
import { TokenProcessor } from './token.processor';
import { ServiceUtil } from '../../../shared/utils/service.util';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TokenMarketsRepository } from '../../cw20-token/repositories/token-markets.repository';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { TokenHolderStatistic } from '../../../shared/entities/token-holder-statistic.entity';
import { Explorer } from 'src/shared/entities/explorer.entity';
import { Asset } from 'src/shared/entities/asset.entity';
import { SyncPoint } from 'src/shared/entities/sync-point.entity';

@Module({
  imports: [
    SharedModule,
    ConfigModule,
    HttpModule,
    TypeOrmModule.forFeature([
      TokenMarketsRepository,
      TokenHolderStatistic,
      Explorer,
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
