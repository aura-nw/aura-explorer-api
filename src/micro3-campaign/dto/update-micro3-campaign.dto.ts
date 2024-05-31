import { PartialType } from '@nestjs/swagger';
import { CreateMicro3CampaignDto } from './create-micro3-campaign.dto';

export class UpdateMicro3CampaignDto extends PartialType(CreateMicro3CampaignDto) {}
