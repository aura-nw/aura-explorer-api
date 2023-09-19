import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import {
  AkcLogger,
  BaseApiResponse,
  MESSAGES,
  ReqContext,
  RequestContext,
  TokenMarkets,
  USER_ROLE,
} from '../../../shared';
import { TokenMarketService } from '../services/token-market.service';
import { JwtAuthGuard } from '../../../auth/jwt/jwt-auth.guard';
import { RoleGuard } from '../../../auth/role/roles.guard';
import { Roles } from '../../../auth/role/roles.decorator';
import {
  GetIbcTokenDetail,
  GetIbcTokenResult,
} from '../dtos/get-ibc-token-result.dto';
import { IbcTokenParamsDto } from '../dtos/ibc-token-params.dto';
import { StoreIbcTokenParamsDto } from '../dtos/store-ibc-token-params.dto';

@Controller()
@ApiTags('ibc-token')
@ApiUnauthorizedResponse({
  description: MESSAGES.ERROR.NOT_PERMISSION,
})
@ApiForbiddenResponse({
  description: MESSAGES.ERROR.NOT_PERMISSION,
})
@ApiBadRequestResponse({
  description: MESSAGES.ERROR.BAD_REQUEST,
})
export class TokenMarketController {
  constructor(
    private readonly tokenMarketService: TokenMarketService,
    private readonly logger: AkcLogger,
  ) {
    this.logger.setContext(TokenMarketController.name);
  }

  @Get('admin/ibc-token')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(USER_ROLE.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get list ibc token' })
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: GetIbcTokenResult })
  async getIbcToken(
    @ReqContext() ctx: RequestContext,
    @Query() request: IbcTokenParamsDto,
  ): Promise<BaseApiResponse<TokenMarkets[]>> {
    this.logger.log(ctx, `${this.getIbcToken.name} was called!`);
    const { result, count } = await this.tokenMarketService.getIbcTokens(
      ctx,
      request,
    );

    return { data: result, meta: { count } };
  }

  @Get('admin/cw20-token')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(USER_ROLE.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get list cw20 token' })
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: GetIbcTokenResult })
  async getCW20Token(
    @ReqContext() ctx: RequestContext,
    @Query() request: IbcTokenParamsDto,
  ): Promise<BaseApiResponse<TokenMarkets[]>> {
    this.logger.log(ctx, `${this.getCW20Token.name} was called!`);
    const { result, count } = await this.tokenMarketService.getCW20Tokens(
      ctx,
      request,
    );

    return { data: result, meta: { count } };
  }

  @Get('admin/ibc-token/:id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(USER_ROLE.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get ibc token by id.' })
  @ApiOkResponse({ type: GetIbcTokenDetail })
  async getIbcTokenDetail(
    @ReqContext() ctx: RequestContext,
    @Param('id') id: number,
  ): Promise<TokenMarkets> {
    this.logger.log(ctx, `${this.getIbcTokenDetail.name} was called!`);
    const result = await this.tokenMarketService.getIbcTokenDetail(ctx, id);
    return result;
  }

  @Post('admin/ibc-token')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(USER_ROLE.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create ibc token' })
  @ApiResponse({ status: HttpStatus.CREATED })
  async createIbcToken(
    @ReqContext() ctx: RequestContext,
    @Body() request: StoreIbcTokenParamsDto,
  ): Promise<any> {
    this.logger.log(ctx, `${this.createIbcToken.name} was called!`);
    return await this.tokenMarketService.createIbcToken(ctx, request);
  }

  @Put('admin/ibc-token')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(USER_ROLE.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update ibc token' })
  @ApiResponse({ status: HttpStatus.OK })
  async updateNameTag(
    @ReqContext() ctx: RequestContext,
    @Body() request: StoreIbcTokenParamsDto,
  ): Promise<any> {
    this.logger.log(ctx, `${this.updateNameTag.name} was called!`);
    return await this.tokenMarketService.updateIbcToken(ctx, request);
  }

  @Delete('admin/ibc-token/:id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(USER_ROLE.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete ibc token' })
  @ApiResponse({ status: HttpStatus.OK })
  async deleteNameTag(
    @ReqContext() ctx: RequestContext,
    @Param('id') id: number,
  ): Promise<any> {
    this.logger.log(ctx, `${this.deleteNameTag.name} was called!`);
    return await this.tokenMarketService.deleteIbcToken(ctx, id);
  }
}
