import {
  CacheInterceptor,
  ClassSerializerInterceptor,
  Controller,
  Get,
  HttpStatus,
  Param,
  ParseArrayPipe,
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
import { LiteValidatorOutput } from '../dtos/lite-validator-output.dto';

import { ValidatorOutput } from '../dtos/validator-output.dto';
import { ValidatorService } from '../services/validator.service';

@ApiTags('validators')
@Controller('validators')
export class ValidatorController {
  constructor(
    private readonly validatorService: ValidatorService,
    private readonly logger: AkcLogger,
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
  @UseInterceptors(CacheInterceptor)
  async getValidators(
    @ReqContext() ctx: RequestContext,
  ): Promise<BaseApiResponse<LiteValidatorOutput[]>> {
    this.logger.log(ctx, `${this.getValidators.name} was called!`);

    const { validators } = await this.validatorService.getValidators(ctx);

    return { data: validators, meta: {} };
  }

  @Get('validator-info')
  @ApiOperation({
    summary: 'Get validator info by address',
  })
  @ApiResponse({
    status: HttpStatus.OK,
  })
  @UseInterceptors(ClassSerializerInterceptor)
  @UseInterceptors(CacheInterceptor)
  async getValidatorInfo(
    @ReqContext() ctx: RequestContext,
    @Query('address', new ParseArrayPipe({ items: String, separator: ',' }))
    address: string[],
  ) {
    const data = await this.validatorService.getValidatorInfo(ctx, address);
    return { data, meta: {} };
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

    const validator = await this.validatorService.getValidatorByAddress(
      ctx,
      address,
    );

    return { data: validator, meta: {} };
  }

  // TODO: will be deleted in the future because fe doesn't use this anymore.
  // @Get(':validatorAddress/delegations')
  // @ApiOperation({ summary: 'Get delegation by validator address' })
  // @ApiResponse({
  //   status: HttpStatus.OK,
  //   type: SwaggerBaseApiResponse(DelegationOutput),
  // })
  // @UseInterceptors(ClassSerializerInterceptor)
  // @UseInterceptors(CacheInterceptor)
  // async getDelegationByAddress(
  //   @ReqContext() ctx: RequestContext,
  //   @Param('validatorAddress') validatorAddress: string,
  //   @Query() query: DelegationParamsDto,
  // ): Promise<BaseApiResponse<DelegationOutput[]>> {
  //   this.logger.log(ctx, `${this.getDelegationByAddress.name} was called!`);

  //   const { delegations, count } =
  //     await this.validatorService.getDelegationByAddress(
  //       ctx,
  //       validatorAddress,
  //       query,
  //     );
  //   return { data: delegations, meta: { count } };
  // }

  @Get('delegations/:delegatorAddress')
  @ApiOperation({
    summary: 'Get list delegations',
  })
  @ApiResponse({
    status: HttpStatus.OK,
  })
  @UseInterceptors(ClassSerializerInterceptor)
  async getDelegations(
    @ReqContext() ctx: RequestContext,
    @Param('delegatorAddress') delegatorAddress: string,
  ): Promise<any> {
    this.logger.log(ctx, `${this.getDelegations.name} was called!`);
    const result = await this.validatorService.getDelegations(
      ctx,
      delegatorAddress,
    );

    return { data: result, meta: {} };
  }

  // TODO: will be deleted in the future because the FE doesn't use this anymore.
  // @Get('delegations/delegator/:delegatorAddress')
  // @ApiOperation({
  //   summary: 'Get delegations by address',
  // })
  // @ApiResponse({
  //   status: HttpStatus.OK,
  // })
  // @UseInterceptors(ClassSerializerInterceptor)
  // @UseInterceptors(CacheInterceptor)
  // async getDelegationsByDelegatorAddress(
  //   @ReqContext() ctx: RequestContext,
  //   @Param('delegatorAddress') delegatorAddress: string,
  // ): Promise<any> {
  //   const result = await this.validatorService.getDelegationsByDelegatorAddress(
  //     ctx,
  //     delegatorAddress,
  //   );
  //   return { data: result, meta: {} };
  // }
}
