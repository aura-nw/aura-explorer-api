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
import { ContractCodeIdParamsDto } from '../dtos/contract-code-id-params.dto';
import { ContractParamsDto } from '../dtos/contract-params.dto';
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

  @Post()
  @ApiOperation({ summary: 'Get list contracts' })
  @ApiResponse({ status: HttpStatus.OK })
  @UseInterceptors(ClassSerializerInterceptor)
  @UseInterceptors(CacheInterceptor)
  async getContracts(
    @ReqContext() ctx: RequestContext,
    @Body() request: ContractParamsDto,
  ): Promise<any> {
    this.logger.log(ctx, `${this.getContracts.name} was called!`);
    const { contracts, count } = await this.contractService.getContracts(
      ctx,
      request,
    );

    return { data: contracts, meta: { count } };
  }

  @Get(':contractAddress')
  @ApiOperation({ summary: 'Get contract detail by contract address' })
  @ApiResponse({ status: HttpStatus.OK })
  @UseInterceptors(ClassSerializerInterceptor)
  async getContractByAddress(
    @ReqContext() ctx: RequestContext,
    @Param('contractAddress') contractAddress: string,
  ): Promise<any> {
    this.logger.log(ctx, `${this.getContractByAddress.name} was called!`);
    const contract = await this.contractService.getContractByAddress(
      ctx,
      contractAddress,
    );

    return { data: contract, meta: {} };
  }

  @Post('contract-code/list')
  @ApiOperation({ summary: 'Get list contracts code' })
  @ApiResponse({ status: HttpStatus.OK })
  @UseInterceptors(ClassSerializerInterceptor)
  @UseInterceptors(CacheInterceptor)
  async getContractsCodeId(
    @ReqContext() ctx: RequestContext,
    @Body() request: ContractCodeIdParamsDto,
  ): Promise<any> {
    this.logger.log(ctx, `${this.getContractsCodeId.name} was called!`);
    const { contracts, count } = await this.contractService.getContractsCodeId(
      ctx,
      request,
    );

    return { data: contracts, meta: { count } };
  }

  @Get('contract-code/:codeId')
  @ApiOperation({ summary: 'Get contracts code id detail' })
  @ApiResponse({ status: HttpStatus.OK })
  @UseInterceptors(ClassSerializerInterceptor)
  @UseInterceptors(CacheInterceptor)
  async getContractsCodeIdDetail(
    @ReqContext() ctx: RequestContext,
    @Param('codeId') codeId: number,
  ): Promise<any> {
    this.logger.log(ctx, `${this.getContractsCodeIdDetail.name} was called!`);
    const contracts = await this.contractService.getContractsCodeIdDetail(
      ctx,
      codeId,
    );

    return { data: contracts, meta: {} };
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

  @Get('token/:contractAddress')
  async getTokenByContractAddress(
    @ReqContext() ctx: RequestContext,
    @Param('contractAddress') contractAddress: string,
  ) {
    this.logger.log(ctx, `${this.getTokenByContractAddress.name} was called!`);
    const token = await this.contractService.getTokenByContractAddress(
      ctx,
      contractAddress,
    );

    return { data: token, meta: {} };
  }

  @Get(':contractAddress/nft/:tokenId')
  @ApiOperation({ summary: 'Get NFT detail' })
  @ApiResponse({ status: HttpStatus.OK })
  @UseInterceptors(ClassSerializerInterceptor)
  async getNftDetail(
    @ReqContext() ctx: RequestContext,
    @Param('contractAddress') contractAddress: string,
    @Param('tokenId') tokenId: string,
  ) {
    this.logger.log(ctx, `${this.getNftDetail.name} was called!`);
    const nft = await this.contractService.getNftDetail(
      ctx,
      contractAddress,
      tokenId,
    );
    return { data: nft, meta: {} };
  }
}
