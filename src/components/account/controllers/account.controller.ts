import {
  CacheInterceptor,
  ClassSerializerInterceptor,
  Controller,
  Get,
  HttpStatus,
  Param,
  UseInterceptors,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  AkcLogger,
  ReqContext,
  RequestContext,
  SwaggerBaseApiResponse,
} from '../../../shared';
import { AccountOutput } from '../dtos/account-output.dto';
import { AccountService } from '../services/account.service';

@ApiTags('account')
@Controller('account')
export class AccountController {
  constructor(
    private readonly accountService: AccountService,
    private readonly logger: AkcLogger,
  ) {
    this.logger.setContext(AccountController.name);
  }

  @Get(':address')
  @ApiOperation({ summary: 'Get total balance by address' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse(AccountOutput),
  })
  @UseInterceptors(ClassSerializerInterceptor)
  async getTotalBalanceByAddress(
    @ReqContext() ctx: RequestContext,
    @Param('address') address: string,
  ): Promise<any> {
    this.logger.log(ctx, `${this.getTotalBalanceByAddress.name} was called!`);

    const account = await this.accountService.getTotalBalanceByAddress(
      ctx,
      address,
    );

    return { data: account };
  }

  @Get('/list/:address')
  @ApiOperation({ summary: 'Get total balance by address' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse(AccountOutput),
  })
  @UseInterceptors(ClassSerializerInterceptor)
  @UseInterceptors(CacheInterceptor)
  async getTotalBalanceByListAddress(
    @ReqContext() ctx: RequestContext,
    @Param('address') listAddress: string,
  ): Promise<any> {
    const address = listAddress.split(',');
    const account = await this.accountService.getTotalBalanceByListAddress(
      ctx,
      address,
    );

    return { data: account };
  }
}
