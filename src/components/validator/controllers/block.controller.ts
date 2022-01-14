import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  HttpStatus,
  Param,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  AkcLogger,
  BaseApiResponse,
  RequestContext,
  SwaggerBaseApiResponse,
  ReqContext,
} from '../../../shared';

import { BlockOutput, LiteBlockOutput } from '../dtos/block-output.dto';
import { BlockParamsDto } from '../dtos/block-params.dto';
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

  @Get()
  @ApiOperation({ summary: 'Get latest block API - defaults to 20 blocks' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse(LiteBlockOutput),
  })
  @UseInterceptors(ClassSerializerInterceptor)
  async getBlocks(
    @ReqContext() ctx: RequestContext,
    @Query() query: BlockParamsDto,
  ): Promise<BaseApiResponse<LiteBlockOutput[]>> {
    this.logger.log(ctx, `${this.getBlocks.name} was called!`);

    const { blocks, count } = await this.blockService.getBlocks(ctx, query);

    return { data: blocks, meta: { count } };
  }

  @Get(':height')
  @ApiOperation({ summary: 'Get block by height' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse(BlockOutput),
  })
  @UseInterceptors(ClassSerializerInterceptor)
  async getBlockByHeight(
    @ReqContext() ctx: RequestContext,
    @Param('height') height: number,
  ): Promise<any> {
    // ): Promise<BaseApiResponse<BlockOutput>> {
    this.logger.log(ctx, `${this.getBlockByHeight.name} was called!`);

    const block = await this.blockService.getBlockByHeight(ctx, height);

    return { data: block, meta: {} };
  }
}
