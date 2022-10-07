import {
  CacheInterceptor,
  ClassSerializerInterceptor,
  Controller,
  Get,
  HttpStatus,
  Query,
  UseInterceptors
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import {
  AkcLogger,
  BaseApiResponse, ReqContext, RequestContext,
  SwaggerBaseApiResponse
} from '../../../shared';
import { BlockLatestDto } from '../dtos/block-latest-params.dto';

import { LiteBlockOutput } from '../dtos/lite-block-output.dto';
import { BlockService } from '../services/block.service';

@ApiTags('blocks')
@Controller('blocks')
export class BlockController {
  constructor(
    private readonly blockService: BlockService,
    private readonly logger: AkcLogger,
  ) {
    this.logger.setContext(BlockController.name);
  }

  @Get('get-blocks-latest')
  @ApiOperation({ summary: 'Get blocks latest' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse(LiteBlockOutput),
  })
  @UseInterceptors(ClassSerializerInterceptor)
  @UseInterceptors(CacheInterceptor)
  async getBlocksLatest(
    @ReqContext() ctx: RequestContext,
    @Query() query: BlockLatestDto,
  ): Promise<BaseApiResponse<LiteBlockOutput[]>> {
    this.logger.log(ctx, `${this.getBlocksLatest.name} was called!`);

    const { blocks } = await this.blockService.getTopBlocks(ctx, query);

    return { data: blocks, meta: {} };
  }
}
