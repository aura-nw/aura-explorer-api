import { CacheInterceptor, ClassSerializerInterceptor, Controller, Get, HttpStatus, Param, Query, UseInterceptors } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { LiteTransactionOutput } from "../../../components/transaction/dtos/transaction-output.dto";
import { TransactionService } from "../../../components/transaction/services/transaction.service";
import { DelegationParamsDto } from "../../../components/validator/dtos/delegation-params.dto";
import { AkcLogger, BaseApiResponse, ReqContext, RequestContext, SwaggerBaseApiResponse } from "../../../shared";
import { AccountOutput } from '../dtos/account-output.dto';
import { AccountService } from '../services/account.service';

@ApiTags('account')
@Controller('account')
export class AccountController {
  constructor(
    private readonly accountService: AccountService,
    private readonly transactionService: TransactionService,
    private readonly logger: AkcLogger,
  ) {
    this.logger.setContext(AccountController.name);
  }

  @Get(':address')
  @ApiOperation({ summary: 'Get account detail by address' })
  @ApiResponse({
      status: HttpStatus.OK,
      type: SwaggerBaseApiResponse(AccountOutput),
  })
  @UseInterceptors(ClassSerializerInterceptor)
  async getAccountDetailByAddress(
      @ReqContext() ctx: RequestContext,
      @Param('address') address: string,
  ): Promise<any> {
      this.logger.log(ctx, `${this.getAccountDetailByAddress.name} was called!`);

      const account = await this.accountService.getAccountDetailByAddress(ctx, address);

      return { data: account, meta: {} };
  }

  @Get(':address/transaction')
  @ApiOperation({ summary: 'Get transaction by address' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse(LiteTransactionOutput),
  })
  @UseInterceptors(ClassSerializerInterceptor)
  @UseInterceptors(CacheInterceptor)
  async getTransactionByDelegatorAddress(
    @ReqContext() ctx: RequestContext,
    @Param('address') address: string,
    @Query() query: DelegationParamsDto,
  ): Promise<BaseApiResponse<LiteTransactionOutput[]>> {
    this.logger.log(ctx, `${this.getTransactionByDelegatorAddress.name} was called!`);

    const { transactions, count } = await this.transactionService.getTransactionByDelegatorAddress(ctx, address, query);

    return { data: transactions, meta: {count} };
  }
}
