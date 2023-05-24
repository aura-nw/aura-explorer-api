import {
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

    const account = await this.accountService.getAccountDetailByAddress(
      ctx,
      address,
    );

    return { data: account, meta: {} };
  }
}
