import {
  CacheInterceptor,
  ClassSerializerInterceptor,
  Controller,
  Get,
  HttpStatus,
  Param,
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

import { BlockOutput } from '../dtos/block-output.dto';
import { BlockParamsDto } from '../dtos/block-params.dto';
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

  @Get()
  @ApiOperation({ summary: 'Get latest block API - defaults to 20 blocks' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse(LiteBlockOutput),
  })
  @UseInterceptors(CacheInterceptor)
  @UseInterceptors(ClassSerializerInterceptor)
  async getBlocks(
    @ReqContext() ctx: RequestContext,
    @Query() query: BlockParamsDto,
  ): Promise<BaseApiResponse<LiteBlockOutput[]>> {
    this.logger.log(ctx, `${this.getBlocks.name} was called!`);

    const { blocks, count } = await this.blockService.getBlocks(ctx, query);

    return { data: blocks, meta: { count } };
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
    this.logger.log(ctx, `${this.getDataBlocksByAddress.name} was called!`);

    const { blocks } = await this.blockService.getTopBlocks(ctx, query);

    return { data: blocks, meta: {} };
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
    this.logger.log(ctx, `${this.getBlockByHeight.name} was called!`);

    const block = await this.blockService.getBlockByHeight(ctx, height);

    return { data: block, meta: {} };
  }

  @Get('id/:blockId')
  @ApiOperation({ summary: 'Get block by id' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse(BlockOutput),
  })
  @UseInterceptors(ClassSerializerInterceptor)
  async getBlockById(
    @ReqContext() ctx: RequestContext,
    @Param('blockId') blockId: number,
  ): Promise<any> {
    this.logger.log(ctx, `${this.getBlockById.name} was called!`);

    const block = await this.blockService.getBlockById(ctx, blockId);

    return { data: block, meta: {} };
  }

  @Get(':validatorAddress/validator')
  @ApiOperation({ summary: 'Get blocks by validator address' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse(LiteBlockOutput),
  })
  @UseInterceptors(ClassSerializerInterceptor)
  @UseInterceptors(CacheInterceptor)
  async getBlockByValidatorAddress(
    @ReqContext() ctx: RequestContext,
    @Param('validatorAddress') validatorAddress: string,
    @Query() query: BlockParamsDto,
  ): Promise<BaseApiResponse<LiteBlockOutput[]>> {
    this.logger.log(ctx, `${this.getBlockByValidatorAddress.name} was called!`);

    const { blocks, count } = await this.blockService.getBlockByValidatorAddress(ctx, validatorAddress, query);

    return { data: blocks, meta: { count } };
  }

  @Get(':validatorAddress/latest')
  @ApiOperation({ summary: 'Get 100 blocks latest' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse(LiteBlockOutput),
  })
  @UseInterceptors(ClassSerializerInterceptor)
  @UseInterceptors(CacheInterceptor)
  async getDataBlocksByAddress(
    @ReqContext() ctx: RequestContext,
    @Param('validatorAddress') validatorAddress: string,
  ): Promise<BaseApiResponse<LiteBlockOutput[]>> {
    this.logger.log(ctx, `${this.getDataBlocksByAddress.name} was called!`);

    const { blocks } = await this.blockService.getDataBlocksByAddress(ctx, validatorAddress);

    return { data: blocks, meta: {} };
  }
}
