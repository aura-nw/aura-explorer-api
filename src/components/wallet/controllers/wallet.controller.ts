import { ClassSerializerInterceptor, Controller, Get, HttpStatus, Param, UseInterceptors } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { AkcLogger, ReqContext, RequestContext, SwaggerBaseApiResponse } from "../../../shared";
import { WalletOutput } from "../dtos/wallet-output.dto";
import { WalletService } from "../services/wallet.service";

@ApiTags('wallets')
@Controller('wallets')
export class WalletController {
    constructor(
        private readonly walletService: WalletService,
        private readonly logger: AkcLogger
    ) {
        this.logger.setContext(WalletController.name);
    }

    @Get(':address')
    @ApiOperation({ summary: 'Get wallet detail by address' })
    @ApiResponse({
        status: HttpStatus.OK,
        type: SwaggerBaseApiResponse(WalletOutput),
    })
    @UseInterceptors(ClassSerializerInterceptor)
    async getWalletDetailByAddress(
        @ReqContext() ctx: RequestContext,
        @Param('address') address: string,
    ): Promise<any> {
        this.logger.log(ctx, `${this.getWalletDetailByAddress.name} was called!`);

        const tx = await this.walletService.getWalletDetailByAddress(ctx, address);

        return { data: tx, meta: {} };
  }
}