import {
  CacheInterceptor,
  ClassSerializerInterceptor,
  Controller,
  Get,
  HttpStatus,
  Param,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  AkcLogger,
  BaseApiResponse,
  RequestContext,
  SwaggerBaseApiResponse,
  ReqContext,
} from '../../../shared';

import { TxParamsDto } from '../dtos/transaction-params.dto';
import { TransactionOutput } from '../dtos/transaction-output.dto';
import { TransactionService } from '../services/transaction.service';
import { LiteTransactionOutput } from '../dtos/lite-transaction-output.dto';

@ApiTags('transactions')
@Controller('transactions')
export class TransactionController {
  constructor(
    private readonly transactionService: TransactionService,
    private readonly logger: AkcLogger,
  ) {
    this.logger.setContext(TransactionController.name);
  }

  // @Get()
  // @ApiOperation({
  //   summary: 'Get latest transaction API - defaults to 20 transactions',
  // })
  // @ApiResponse({
  //   status: HttpStatus.OK,
  //   type: SwaggerBaseApiResponse(LiteTransactionOutput),
  // })
  // @UseInterceptors(ClassSerializerInterceptor)
  // @UseInterceptors(CacheInterceptor)
  // async getTxs(
  //   @ReqContext() ctx: RequestContext,
  //   @Query() query: TxParamsDto,
  // ): Promise<BaseApiResponse<LiteTransactionOutput[]>> {
  //   this.logger.log(ctx, `${this.getTxs.name} was called!`);

  //   const { txs, count } = await this.transactionService.getTxs(ctx, query);

  //   return { data: txs, meta: { count } };
  // }

  @Get(':hash')
  @ApiOperation({ summary: 'Get transaction by hash' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse(TransactionOutput),
  })
  @UseInterceptors(ClassSerializerInterceptor)
  async getTxByHash(
    @ReqContext() ctx: RequestContext,
    @Param('hash') hash: string,
  ): Promise<any> {
    // ): Promise<BaseApiResponse<BlockOutput>> {
    this.logger.log(ctx, `${this.getTxByHash.name} was called!`);

    const tx = await this.transactionService.getTxByHash(ctx, hash);

    return { data: tx, meta: {} };
  }
}
