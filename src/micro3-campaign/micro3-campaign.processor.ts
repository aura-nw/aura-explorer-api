import { InjectQueue, Process, Processor } from '@nestjs/bull';
import { MICRO3_QUEUES } from './const/common';
import { Logger, OnModuleInit } from '@nestjs/common';
import { Queue } from 'bull';
import { InjectRepository } from '@nestjs/typeorm';
import { HaloTradeActivity } from './entities/micro3.entity';
import { Repository } from 'typeorm';
import { CronExpression } from '@nestjs/schedule';

@Processor(MICRO3_QUEUES.CAMPAIGN.QUEUE_NAME)
export class Micro3CampaignProcessor implements OnModuleInit {
  private readonly logger = new Logger(Micro3CampaignProcessor.name);

  constructor(
    @InjectRepository(HaloTradeActivity)
    private readonly haloTradeActivityRepository: Repository<HaloTradeActivity>,
    @InjectQueue(MICRO3_QUEUES.CAMPAIGN.QUEUE_NAME)
    private readonly haloActivityQueue: Queue,
  ) {
    this.logger.log(
      '============== Constructor Micro3 Campaign(Halo) Processor Service ==============',
    );
  }
  onModuleInit() {
    this.logger.log(
      '============== On Module Init Micro3 Campaign(Halo) Processor Service ==============',
    );
    this.haloActivityQueue.add(
      MICRO3_QUEUES.CAMPAIGN.JOBS.HALO_ACTIVITY,
      {},
      {
        repeat: { cron: CronExpression.EVERY_30_SECONDS },
      },
    );
  }

  //   @Process(MICRO3_QUEUES.CAMPAIGN.JOBS.HALO_ACTIVITY)
  //   async handleHaloActivity(job: any) {}
}
