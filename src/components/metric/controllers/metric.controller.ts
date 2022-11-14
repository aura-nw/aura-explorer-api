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
import { MetricParamsDto } from '../dtos/metric-params.dto';
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

  @Get('blocks')
  @ApiOperation({ summary: 'Get block metric API' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse(MetricOutput),
  })
  @UseInterceptors(ClassSerializerInterceptor)
  async getBlockMetric(
    @ReqContext() ctx: RequestContext,
    @Query() query: MetricParamsDto,
  ): Promise<BaseApiResponse<MetricOutput[]>> {
    this.logger.log(ctx, `${this.getBlockMetric.name} was called!`);

    const metrics = await this.metricService.getBlock(ctx, query.range);

    return { data: metrics, meta: null };
  }

  @Get('transactions')
  @ApiOperation({ summary: 'Get transaction metric API' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse(MetricOutput),
  })
  @UseInterceptors(ClassSerializerInterceptor)
  async getTransactionMetric(
    @ReqContext() ctx: RequestContext,
    @Query() query: MetricParamsDto,
  ): Promise<BaseApiResponse<MetricOutput[]>> {
    this.logger.log(ctx, `${this.getTransactionMetric.name} was called!`);

    const metrics = await this.metricService.getTransaction(
      ctx,
      query.range,
      query.timezone,
    );

    return { data: metrics, meta: null };
  }

  @Get('validators')
  @ApiOperation({ summary: 'Get validator metric API' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse(MetricOutput),
  })
  @UseInterceptors(ClassSerializerInterceptor)
  async getValidatorMetric(
    @ReqContext() ctx: RequestContext,
    @Query() query: MetricParamsDto,
  ): Promise<BaseApiResponse<MetricOutput[]>> {
    this.logger.log(ctx, `${this.getValidatorMetric.name} was called!`);

    const metrics = await this.metricService.getValidator(ctx, query.range);

    return { data: metrics, meta: null };
  }

  @Get('cw20-tokens')
  @ApiOperation({ summary: 'Get cw20 metric API' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse(MetricOutput),
  })
  @UseInterceptors(ClassSerializerInterceptor)
  async getCw20TokensMetric(
    @ReqContext() ctx: RequestContext,
    @Query() query: Cw20MetricParamsDto,
  ): Promise<BaseApiResponse<MetricOutput[]>> {
    this.logger.log(ctx, `${this.getCw20TokensMetric.name} was called!`);

    const metrics = await this.metricService.getCw20Tokens(ctx, query.range, query.type, query.timezone);

    return { data: metrics, meta: null };
  }
}
