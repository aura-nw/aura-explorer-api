import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
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
import { GetIbcTokenResult } from '../dtos/get-ibc-token-result.dto';
import { IbcTokenParamsDto } from '../dtos/ibc-token-params.dto';

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
  // @UseGuards(JwtAuthGuard, RoleGuard)
  // @Roles(USER_ROLE.ADMIN)
  // @ApiBearerAuth()
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
  // @UseGuards(JwtAuthGuard, RoleGuard)
  // @Roles(USER_ROLE.ADMIN)
  // @ApiBearerAuth()
  @ApiOperation({ summary: 'Get list cw20 token' })
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: GetIbcTokenResult })
  async getCW20Token(
    @ReqContext() ctx: RequestContext,
    @Query() request: IbcTokenParamsDto,
  ): Promise<BaseApiResponse<TokenMarkets[]>> {
    this.logger.log(ctx, `${this.getCW20Token.name} was called!`);
    const { result, count } = await this.tokenMarketService.getIbcTokens(
      ctx,
      request,
    );

    return { data: result, meta: { count } };
  }
}
