import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { Micro3CampaignService } from './micro3-campaign.service';
import { CreateMicro3CampaignDto } from './dto/create-micro3-campaign.dto';
import { UpdateMicro3CampaignDto } from './dto/update-micro3-campaign.dto';

@Controller('micro3-campaign')
export class Micro3CampaignController {
  constructor(private readonly micro3CampaignService: Micro3CampaignService) {}

  @Post()
  create(@Body() createMicro3CampaignDto: CreateMicro3CampaignDto) {
    return this.micro3CampaignService.create(createMicro3CampaignDto);
  }

  @Get()
  findAll() {
    return this.micro3CampaignService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.micro3CampaignService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateMicro3CampaignDto: UpdateMicro3CampaignDto,
  ) {
    return this.micro3CampaignService.update(+id, updateMicro3CampaignDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.micro3CampaignService.remove(+id);
  }
}
