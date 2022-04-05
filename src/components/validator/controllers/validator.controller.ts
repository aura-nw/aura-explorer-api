import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  HttpStatus,
  Param,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { LiteTransactionOutput } from '../../../components/transaction/dtos/lite-transaction-output.dto';
import { TransactionService } from '../../../components/transaction/services/transaction.service';
import {
  AkcLogger,
  BaseApiResponse,
  RequestContext,
  SwaggerBaseApiResponse,
  ReqContext,
} from '../../../shared';
import { DelegationOutput } from '../dtos/delegation-output.dto';
import { DelegationParamsDto } from '../dtos/delegation-params.dto';
import { LiteValidatorOutput } from '../dtos/lite-validator-output.dto';

import { ValidatorOutput } from '../dtos/validator-output.dto';
import { ValidatorService } from '../services/validator.service';

@ApiTags('validators')
@Controller('validators')
export class ValidatorController {
  constructor(
    private readonly validatorService: ValidatorService,
    private readonly logger: AkcLogger,
    private readonly transactionService: TransactionService,
  ) {
    this.logger.setContext(ValidatorController.name);
  }

  @Get()
  @ApiOperation({ summary: 'Get validators info' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse(LiteValidatorOutput),
  })
  @UseInterceptors(ClassSerializerInterceptor)
  async getValidators(
    @ReqContext() ctx: RequestContext,
  ): Promise<BaseApiResponse<LiteValidatorOutput[]>> {
    this.logger.log(ctx, `${this.getValidators.name} was called!`);

    const { validators, count } = await this.validatorService.getValidators(ctx);

    return { data: validators, meta: { count } };
  }

  @Get(':address')
  @ApiOperation({ summary: 'Get validator by address' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse(ValidatorOutput),
  })
  @UseInterceptors(ClassSerializerInterceptor)
  async getValidatorByAddress(
    @ReqContext() ctx: RequestContext,
    @Param('address') address: string,
  ): Promise<BaseApiResponse<ValidatorOutput>> {
    this.logger.log(ctx, `${this.getValidatorByAddress.name} was called!`);

    const validator = await this.validatorService.getValidatorByAddress(ctx, address);

    return { data: validator, meta: {} };
  }

  @Get(':validatorAddress/delegations')
  @ApiOperation({ summary: 'Get delegation by validator address' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse(DelegationOutput),
  })
  @UseInterceptors(ClassSerializerInterceptor)
  async getDelegationByAddress(
    @ReqContext() ctx: RequestContext,
    @Param('validatorAddress') validatorAddress: string,
    @Query() query: DelegationParamsDto,
  ): Promise<BaseApiResponse<DelegationOutput[]>> {
    this.logger.log(ctx, `${this.getDelegationByAddress.name} was called!`);

    const { delegations, count } = await this.validatorService.getDelegationByAddress(ctx, validatorAddress, query);

    return { data: delegations, meta: {count} };
  }

  @Get('events/:validatorAddress')
  @ApiOperation({ summary: 'Get transaction by validator address' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse(LiteTransactionOutput),
  })
  @UseInterceptors(ClassSerializerInterceptor)
  async getTransactionByAddress(
    @ReqContext() ctx: RequestContext,
    @Param('validatorAddress') validatorAddress: string,
    @Query() query: DelegationParamsDto,
  ): Promise<BaseApiResponse<LiteTransactionOutput[]>> {
    this.logger.log(ctx, `${this.getTransactionByAddress.name} was called!`);

    const { transactions, count } = await this.transactionService.getTransactionByAddress(ctx, validatorAddress, query);

    return { data: transactions, meta: {count} };
  }

  @Get('delegations/:delegatorAddress')
  @ApiOperation({
      summary: 'Get list delegations',
  })
  @ApiResponse({
      status: HttpStatus.OK
  })
  @UseInterceptors(ClassSerializerInterceptor)
  async getDelegations(
      @ReqContext() ctx: RequestContext,
      @Param('delegatorAddress') delegatorAddress: string
  ): Promise<any> {
      this.logger.log(ctx, `${this.getDelegations.name} was called!`);
      const delegations = await this.validatorService.getDelegations(ctx, delegatorAddress);

      return { data: delegations, meta: {} };
  }
}
