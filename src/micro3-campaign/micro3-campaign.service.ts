import { Injectable } from '@nestjs/common';
import { CreateMicro3CampaignDto } from './dto/create-micro3-campaign.dto';
import { UpdateMicro3CampaignDto } from './dto/update-micro3-campaign.dto';

@Injectable()
export class Micro3CampaignService {
  create(createMicro3CampaignDto: CreateMicro3CampaignDto) {
    return 'This action adds a new micro3Campaign';
  }

  findAll() {
    return `This action returns all micro3Campaign`;
  }

  findOne(id: number) {
    return `This action returns a #${id} micro3Campaign`;
  }

  update(id: number, updateMicro3CampaignDto: UpdateMicro3CampaignDto) {
    return `This action updates a #${id} micro3Campaign`;
  }

  remove(id: number) {
    return `This action removes a #${id} micro3Campaign`;
  }
}
