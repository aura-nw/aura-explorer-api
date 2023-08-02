import {
  Body,
  CacheInterceptor,
  ClassSerializerInterceptor,
  Controller,
  Get,
  HttpStatus,
  Param,
  Post,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  AkcLogger,
  ReqContext,
  RequestContext,
  TokenMarkets,
} from '../../../shared';
import { Cw20TokenByOwnerParamsDto } from '../dtos/cw20-token-by-owner-params.dto';
import { Cw20TokenService } from '../services/cw20-token.service';
import { Cw20TokenMarketParamsDto } from '../dtos/cw20-token-market-params.dto';

@ApiTags('cw20-tokens')
@Controller('cw20-tokens')
export class Cw20TokenController {
  constructor(
    private readonly cw20TokenService: Cw20TokenService,
    private readonly logger: AkcLogger,
  ) {
    this.logger.setContext(Cw20TokenController.name);
  }

  @Get('get-by-owner/:owner')
  @ApiOperation({ summary: 'Get list cw20 tokens by owner' })
  @ApiResponse({ status: HttpStatus.OK })
  @UseInterceptors(ClassSerializerInterceptor)
  @UseInterceptors(CacheInterceptor)
  async getCw20TokensByOwner(
    @ReqContext() ctx: RequestContext,
    @Param('owner') owner: string,
  ): Promise<any> {
    this.logger.log(ctx, `${this.getCw20TokensByOwner.name} was called!`);
    const { tokens, count } = await this.cw20TokenService.getCw20TokensByOwner(
      ctx,
      owner,
    );

    return { data: tokens, meta: { count } };
  }

  @Get('price/:id')
  @ApiOperation({ summary: 'Get price of cw20/cw721 token by id' })
  @ApiResponse({ status: HttpStatus.OK })
  @UseInterceptors(ClassSerializerInterceptor)
  async getPriceById(
    @ReqContext() ctx: RequestContext,
    @Param('id') id: string,
  ): Promise<any> {
    this.logger.log(ctx, `${this.getPriceById.name} was called!`);
    const price = await this.cw20TokenService.getPriceById(ctx, id);

    return { data: price, meta: {} };
  }

  @Get('total-asset/:accountAddress')
  @ApiOperation({ summary: 'Get total asset of coins and tokens' })
  @ApiResponse({ status: HttpStatus.OK })
  @UseInterceptors(ClassSerializerInterceptor)
  async getTotalAssetByAccountAddress(
    @ReqContext() ctx: RequestContext,
    @Param('accountAddress') accountAddress: string,
  ): Promise<any> {
    this.logger.log(
      ctx,
      `${this.getTotalAssetByAccountAddress.name} was called!`,
    );
    const price = await this.cw20TokenService.getTotalAssetByAccountAddress(
      ctx,
      accountAddress,
    );

    return { data: price, meta: {} };
  }

  @Get('token-market')
  @ApiOperation({
    summary: 'Get token market of cw20 token by contract address',
  })
  @ApiResponse({ status: HttpStatus.OK })
  @UseInterceptors(ClassSerializerInterceptor)
  @UseInterceptors(CacheInterceptor)
  async getTokenMarket(
    @ReqContext() ctx: RequestContext,
    @Query() query: Cw20TokenMarketParamsDto,
  ): Promise<TokenMarkets[]> {
    this.logger.log(ctx, `${this.getPriceById.name} was called!`);
    return await this.cw20TokenService.getTokenMarket(ctx, query);
  }
}
