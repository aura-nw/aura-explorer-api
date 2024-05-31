import { Module } from '@nestjs/common';
import { Micro3CampaignService } from './micro3-campaign.service';
import { Micro3CampaignController } from './micro3-campaign.controller';

@Module({
  controllers: [Micro3CampaignController],
  providers: [Micro3CampaignService],
})
export class Micro3CampaignModule {}
