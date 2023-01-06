import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  HttpStatus,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  AkcLogger,
  BaseApiResponse,
  ReqContext,
  RequestContext,
  SwaggerBaseApiResponse,
} from '../../../shared';
import { Cw20MetricParamsDto } from '../dtos/cw20-metric-params.dto';
import { MetricOutput } from '../dtos/metric-output.dto';
import { TokenOutput } from '../dtos/token-output.dto';
import { MetricService } from '../services/metric.service';

@ApiTags('metrics')
@Controller('metrics')
export class MetricController {
  constructor(
    private readonly metricService: MetricService,
    private readonly logger: AkcLogger,
  ) {
    this.logger.setContext(MetricController.name);
  }

  @Get('token')
  @ApiOperation({ summary: 'Get token by coin id' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse(MetricOutput),
  })
  @UseInterceptors(ClassSerializerInterceptor)
  async getTokenInfoMetric(
    @ReqContext() ctx: RequestContext,
    @Query() query: Cw20MetricParamsDto,
  ): Promise<BaseApiResponse<TokenOutput[]>> {
    this.logger.log(ctx, `${this.getTokenInfoMetric.name} was called!`);

    const metrics = await this.metricService.getTokenInfo(
      ctx,
      query.minDate,
      query.range,
      query.coidId,
    );

    return { data: metrics, meta: null };
  }

  @Get('token-market')
  @ApiOperation({ summary: 'Get market info of token' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse(TokenOutput),
  })
  @UseInterceptors(ClassSerializerInterceptor)
  async getTokenMarketInfoMetric(
    @ReqContext() ctx: RequestContext,
    @Query('coinid') coinid: string,
  ): Promise<BaseApiResponse<TokenOutput>> {
    this.logger.log(ctx, `${this.getTokenMarketInfoMetric.name} was called!`);

    const metric = await this.metricService.getTokenMarketInfo(ctx, coinid);

    return { data: metric, meta: null };
  }
}
