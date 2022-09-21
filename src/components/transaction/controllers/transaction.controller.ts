import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  HttpStatus,
  Param, UseInterceptors
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  AkcLogger, ReqContext, RequestContext,
  SwaggerBaseApiResponse
} from '../../../shared';

import { TransactionOutput } from '../dtos/transaction-output.dto';
import { TransactionService } from '../services/transaction.service';

@ApiTags('transactions')
@Controller('transactions')
export class TransactionController {
  constructor(
    private readonly transactionService: TransactionService,
    private readonly logger: AkcLogger,
  ) {
    this.logger.setContext(TransactionController.name);
  }

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
    this.logger.log(ctx, `${this.getTxByHash.name} was called!`);

    const tx = await this.transactionService.getTxByHash(ctx, hash);

    return { data: tx, meta: {} };
  }
}
