import {
  Body,
  CacheInterceptor,
  ClassSerializerInterceptor,
  Controller,
  Get,
  HttpStatus,
  Param,
  Post,
  UseInterceptors,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  AkcLogger,
  ReqContext,
  RequestContext,
  SwaggerBaseApiResponse,
} from '../../../shared';
import { VerifyCodeIdParamsDto } from '../dtos/verify-code-id-params.dto';
import { VerifyCodeStepOutputDto } from '../dtos/verify-code-step-output.dto';
import { ContractService } from '../services/contract.service';

@ApiTags('contracts')
@Controller('contracts')
export class ContractController {
  constructor(
    private readonly contractService: ContractService,
    private readonly logger: AkcLogger,
  ) {
    this.logger.setContext(ContractController.name);
  }

  @Post('verify-code-id')
  @ApiOperation({ summary: 'Verify code id' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Successfully create data',
  })
  @UseInterceptors(ClassSerializerInterceptor)
  @UseInterceptors(CacheInterceptor)
  async verifyCodeId(
    @ReqContext() ctx: RequestContext,
    @Body() request: VerifyCodeIdParamsDto,
  ): Promise<any> {
    this.logger.log(ctx, `${this.verifyCodeId.name} was called!`);
    const result = await this.contractService.verifyCodeId(ctx, request);

    return { data: result, meta: {} };
  }

  @Get('verify-code-id/:codeId')
  @ApiOperation({ summary: 'Get verify code steps' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Successfully retrieve data',
    type: SwaggerBaseApiResponse(VerifyCodeStepOutputDto),
  })
  async getVerifyCodeStep(
    @ReqContext() ctx: RequestContext,
    @Param('codeId') codeId: number,
  ): Promise<any> {
    this.logger.log(ctx, `${this.getVerifyCodeStep.name} was called!`);
    return await this.contractService.getVerifyCodeStep(ctx, codeId);
  }

  @Get('verify/status/:codeId')
  @ApiOperation({ summary: 'Verify contract status' })
  @ApiResponse({ status: HttpStatus.OK })
  @UseInterceptors(ClassSerializerInterceptor)
  @UseInterceptors(CacheInterceptor)
  async verifyContractStatus(
    @ReqContext() ctx: RequestContext,
    @Param('codeId') codeId: number,
  ): Promise<any> {
    this.logger.log(ctx, `${this.verifyContractStatus.name} was called!`);
    const result = await this.contractService.verifyContractStatus(ctx, codeId);

    return { data: result, meta: {} };
  }
}
