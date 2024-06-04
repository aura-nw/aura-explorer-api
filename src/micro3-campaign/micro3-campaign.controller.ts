import { Controller, Get, Query } from '@nestjs/common';
import { Micro3CampaignService } from './micro3-campaign.service';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  CampaignParamDto,
  CampaignResponseDto,
  ResultDto,
} from './dto/verify-micro3-campaign.dto';

@ApiTags('micro3-campaign')
@Controller('micro3-campaign')
export class Micro3CampaignController {
  constructor(private readonly micro3CampaignService: Micro3CampaignService) {}

  @ApiOperation({ summary: 'Verify micro3 campaign quest' })
  // @ApiOkResponse({
  //   description: 'Return user detail.',
  //   type: CampaignResponseDto<any>,
  // })
  @Get()
  async verifyQuest(@Query() query: CampaignParamDto) {
    return await this.micro3CampaignService.verifyQuest(query);
  }
}
