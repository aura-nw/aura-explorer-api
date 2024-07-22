import {
  Body,
  CacheInterceptor,
  ClassSerializerInterceptor,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Query,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
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
  USER_ROLE,
} from 'src/shared';
import { AssetService } from '../services/asset.service';
import { AssetParamsDto } from '../dtos/asset-params.dto';
import { AssetAttributes, GetAssetResult } from '../dtos/get-asset.dto';
import { AssetsTokenMarketParamsDto } from '../dtos/cw20-token-market-params.dto';
import { Roles } from '../../../auth/role/roles.decorator';
import { JwtAuthGuard } from '../../../auth/jwt/jwt-auth.guard';
import { RoleGuard } from '../../../auth/role/roles.guard';
import { UpdateAssetDto } from '../dtos/update-asset-dto';

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

  @Patch('assets/:id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(USER_ROLE.ADMIN)
  @ApiOperation({ summary: 'Update Assets detail' })
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(ClassSerializerInterceptor)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async updateAssetsDetail(
    @ReqContext() ctx: RequestContext,
    @Param('id') id: string,
    @Body() updateAssetDto: UpdateAssetDto,
  ): Promise<Asset> {
    this.logger.log(ctx, `${this.updateAssetsDetail.name} was called!`);
    updateAssetDto.id = +id || 0;
    return await this.assetService.updateAssetsDetail(updateAssetDto);
  }
}
