import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  HttpStatus,
  UseInterceptors,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  AkcLogger,
  BaseApiResponse,
  ReqContext,
  RequestContext,
  SwaggerBaseApiResponse,
} from './shared';

import { AppService } from './app.service';
import { StatusOutput } from './components/dashboard/dtos/status-output.dto';

@ApiTags('dashboard')
@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly logger: AkcLogger,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('status')
  @ApiOperation({
    summary: 'Get status of the aura network',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse(StatusOutput),
  })
  @UseInterceptors(ClassSerializerInterceptor)
  async getStatus(
    @ReqContext() ctx: RequestContext,
  ): Promise<BaseApiResponse<StatusOutput>> {
    this.logger.log(ctx, `${this.getStatus.name} was called!`);

    const status = await this.appService.getStatus(ctx);

    return { data: status, meta: {} };
  }
}
