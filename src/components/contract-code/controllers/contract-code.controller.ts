import {
  Body,
  CacheInterceptor,
  ClassSerializerInterceptor,
  Controller,
  Get,
  HttpStatus,
  Param,
  Post,
  Put,
  UseInterceptors,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AkcLogger, ReqContext, RequestContext } from '../../../shared';
import { ContractCodeParamsDto } from '../dtos/contract-code-params.dto';
import { RegisterContractCodeParamsDto } from '../dtos/register-contract-code-params.dto';
import { UpdateContractCodeParamsDto } from '../dtos/update-contract-code-params.dto';
import { ContractCodeService } from '../services/contract-code.service';

@ApiTags('contract-codes')
@Controller('contract-codes')
export class ContractCodeController {
  constructor(
    private readonly contractCodeService: ContractCodeService,
    private readonly logger: AkcLogger,
  ) {
    this.logger.setContext(ContractCodeController.name);
  }

  @Post('list')
  @ApiOperation({ summary: 'Get list contract codes' })
  @ApiResponse({ status: HttpStatus.OK })
  @UseInterceptors(ClassSerializerInterceptor)
  @UseInterceptors(CacheInterceptor)
  async getContractCodes(
    @ReqContext() ctx: RequestContext,
    @Body() request: ContractCodeParamsDto,
  ): Promise<any> {
    this.logger.log(ctx, `${this.getContractCodes.name} was called!`);
    const { contract_codes, count } =
      await this.contractCodeService.getContractCodes(ctx, request);

    return { data: contract_codes, meta: { count } };
  }

  @Post('')
  @ApiOperation({ summary: 'Register contract code' })
  @ApiResponse({ status: HttpStatus.OK })
  @UseInterceptors(ClassSerializerInterceptor)
  @UseInterceptors(CacheInterceptor)
  async registerContractCode(
    @ReqContext() ctx: RequestContext,
    @Body() request: RegisterContractCodeParamsDto,
  ): Promise<any> {
    this.logger.log(ctx, `${this.registerContractCode.name} was called!`);
    const contract_code = await this.contractCodeService.registerContractCode(
      ctx,
      request,
    );

    return { data: contract_code, meta: {} };
  }

  @Get(':codeId')
  @ApiOperation({ summary: 'Get contract code by code id' })
  @ApiResponse({ status: HttpStatus.OK })
  @UseInterceptors(ClassSerializerInterceptor)
  async getContractCodeByCodeId(
    @ReqContext() ctx: RequestContext,
    @Param('codeId') codeId: number,
  ): Promise<any> {
    this.logger.log(ctx, `${this.getContractCodeByCodeId.name} was called!`);
    const contract_code =
      await this.contractCodeService.getContractCodeByCodeId(ctx, codeId);

    return { data: contract_code, meta: {} };
  }

  @Put(':codeId')
  @ApiOperation({ summary: 'Update contract code' })
  @ApiResponse({ status: HttpStatus.OK })
  @UseInterceptors(ClassSerializerInterceptor)
  async updateContractCode(
    @ReqContext() ctx: RequestContext,
    @Param('codeId') codeId: number,
    @Body() request: UpdateContractCodeParamsDto,
  ): Promise<any> {
    this.logger.log(ctx, `${this.updateContractCode.name} was called!`);
    const contract_code = await this.contractCodeService.updateContractCode(
      ctx,
      codeId,
      request,
    );

    return { data: contract_code, meta: {} };
  }
}
