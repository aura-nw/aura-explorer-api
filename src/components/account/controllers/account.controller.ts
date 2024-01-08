import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  HttpStatus,
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
import { AccountOutput } from '../dtos/account-output.dto';
import { AccountService } from '../services/account.service';
import { AccountRequestDto } from '../dtos/account-request.dto';

@ApiTags('account')
@Controller('account')
export class AccountController {
  constructor(
    private readonly accountService: AccountService,
    private readonly logger: AkcLogger,
  ) {
    this.logger.setContext(AccountController.name);
  }

  @Post('/balance')
  @ApiOperation({ summary: 'Get total balance by address' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse(AccountOutput),
  })
  @UseInterceptors(ClassSerializerInterceptor)
  async getTotalBalanceByAddress(
    @ReqContext() ctx: RequestContext,
    @Body() req: AccountRequestDto,
  ): Promise<any> {
    this.logger.log(ctx, `${this.getTotalBalanceByAddress.name} was called!`);

    const account = await this.accountService.getTotalBalanceByAddress(
      ctx,
      req.address,
    );

    return { data: account };
  }
}
