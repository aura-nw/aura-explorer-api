import { MICRO3_QUEUES } from './const/common';
import { Module } from '@nestjs/common';
import { Micro3CampaignService } from './micro3-campaign.service';
import { Micro3CampaignController } from './micro3-campaign.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Explorer } from '../shared/entities/explorer.entity';
import { ServiceUtil } from '../shared/utils/service.util';
import { SharedModule } from '../shared';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserModule } from '../components/user/user.module';
import { BullModule } from '@nestjs/bull';
import { HaloTradeActivity } from './entities/micro3.entity';

@Module({
  imports: [
    SharedModule,
    HttpModule,
    ConfigModule,
    UserModule,
    TypeOrmModule.forFeature([Explorer]),
    // BullModule.registerQueueAsync({
    //   name: MICRO3_QUEUES.CAMPAIGN.QUEUE_NAME,
    // }),
  ],
  providers: [Micro3CampaignService, ServiceUtil, ConfigService],
  controllers: [Micro3CampaignController],
  // exports: [
  //   BullModule.registerQueueAsync({
  //     name: MICRO3_QUEUES.CAMPAIGN.QUEUE_NAME,
  //   }),
  // ],
})
export class Micro3CampaignModule {}
