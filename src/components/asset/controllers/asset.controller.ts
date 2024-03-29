import {
  CacheInterceptor,
  ClassSerializerInterceptor,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  AkcLogger,
  Asset,
  BaseApiResponse,
  MESSAGES,
  ReqContext,
  RequestContext,
} from 'src/shared';
import { AssetService } from '../services/asset.service';
import { AssetParamsDto } from '../dtos/asset-params.dto';
import { AssetAttributes, GetAssetResult } from '../dtos/get-asset.dto';
import { AssetsTokenMarketParamsDto } from '../dtos/cw20-token-market-params.dto';

@Controller()
@ApiTags('asset')
@ApiBadRequestResponse({
  description: MESSAGES.ERROR.BAD_REQUEST,
})
export class AssetController {
  constructor(
    private readonly assetService: AssetService,
    private readonly logger: AkcLogger,
  ) {
    this.logger.setContext(AssetController.name);
  }

  @Get('assets')
  @ApiOperation({ summary: 'Get list Assets' })
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(ClassSerializerInterceptor)
  @UseInterceptors(CacheInterceptor)
  @ApiOkResponse({ type: GetAssetResult })
  async getAssets(
    @ReqContext() ctx: RequestContext,
    @Query() param: AssetParamsDto,
  ): Promise<BaseApiResponse<Asset[]>> {
    this.logger.log(ctx, `${this.getAssets.name} was called!`);
    const { result, count } = await this.assetService.getAssets(ctx, param);
    return { data: result, meta: { count } };
  }

  @Get('assets/token-market')
  @ApiOperation({
    summary: 'Get token market of cw20 token by contract address',
  })
  @ApiResponse({ status: HttpStatus.OK })
  @UseInterceptors(ClassSerializerInterceptor)
  @UseInterceptors(CacheInterceptor)
  async getAssetsTokenMarket(
    @ReqContext() ctx: RequestContext,
    @Query() query: AssetsTokenMarketParamsDto,
  ): Promise<Asset[]> {
    this.logger.log(ctx, `${this.getAssetsTokenMarket.name} was called!`);
    return await this.assetService.getAssetsTokenMarket(ctx, query);
  }

  @Get('assets/:denom')
  @ApiOperation({ summary: 'Get Assets detail' })
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(ClassSerializerInterceptor)
  @UseInterceptors(CacheInterceptor)
  @ApiOkResponse({ type: AssetAttributes })
  async getAssetsDetail(
    @ReqContext() ctx: RequestContext,
    @Param('denom') denom: string,
  ): Promise<Asset> {
    this.logger.log(ctx, `${this.getAssetsDetail.name} was called!`);
    return await this.assetService.getAssetsDetail(ctx, denom);
  }
}
