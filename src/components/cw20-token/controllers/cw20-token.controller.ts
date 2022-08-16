import { Body, CacheInterceptor, ClassSerializerInterceptor, Controller, Get, HttpStatus, Param, Post, UseInterceptors } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { AkcLogger, ReqContext, RequestContext } from "../../../shared";
import { Cw20TokenByOwnerParamsDto } from "../dtos/cw20-token-by-owner-params.dto";
import { Cw20TokenParamsDto } from "../dtos/cw20-token-params.dto";
import { TokenTransactionParamsDto } from "../dtos/token-transaction-params.dto";
import { Cw20TokenService } from "../services/cw20-token.service";

@ApiTags('cw20-tokens')
@Controller('cw20-tokens')
export class Cw20TokenController {
    constructor(
        private readonly cw20TokenService: Cw20TokenService,
        private readonly logger: AkcLogger,
    ) {
        this.logger.setContext(Cw20TokenController.name);
    }

    @Post()
    @ApiOperation({ summary: 'Get list cw20 tokens' })
    @ApiResponse({ status: HttpStatus.OK })
    @UseInterceptors(ClassSerializerInterceptor)
    @UseInterceptors(CacheInterceptor)
    async getCw20Tokens(@ReqContext() ctx: RequestContext, @Body() request: Cw20TokenParamsDto): Promise<any> {
        this.logger.log(ctx, `${this.getCw20Tokens.name} was called!`);
        const { tokens, count } = await this.cw20TokenService.getCw20Tokens(ctx, request);

        return { data: tokens, meta: { count } };
    }

    @Get(':contractAddress')
    @ApiOperation({ summary: 'Get cw20/cw721 token detail by contract address' })
    @ApiResponse({ status: HttpStatus.OK })
    @UseInterceptors(ClassSerializerInterceptor)
    async getTokenByContractAddress(@ReqContext() ctx: RequestContext, @Param('contractAddress') contractAddress: string): Promise<any> {
        this.logger.log(ctx, `${this.getTokenByContractAddress.name} was called!`);
        const token = await this.cw20TokenService.getTokenByContractAddress(ctx, contractAddress);

        return { data: token, meta: {} };
    }

    @Post('transactions')
    @ApiOperation({ summary: 'Get list transactions of cw20/cw721 token' })
    @ApiResponse({ status: HttpStatus.OK })
    @UseInterceptors(ClassSerializerInterceptor)
    @UseInterceptors(CacheInterceptor)
    async getListTokenTransactions(@ReqContext() ctx: RequestContext, @Body() request: TokenTransactionParamsDto): Promise<any> {
        this.logger.log(ctx, `${this.getListTokenTransactions.name} was called!`);
        const { transactions, count } = await this.cw20TokenService.getListTokenTransactions(ctx, request);

        return { data: transactions, meta: { count } };
    }

    @Post('get-by-owner')
    @ApiOperation({ summary: 'Get list cw20 tokens by owner' })
    @ApiResponse({ status: HttpStatus.OK })
    @UseInterceptors(ClassSerializerInterceptor)
    @UseInterceptors(CacheInterceptor)
    async getCw20TokensByOwner(@ReqContext() ctx: RequestContext, @Body() request: Cw20TokenByOwnerParamsDto): Promise<any> {
        this.logger.log(ctx, `${this.getCw20TokensByOwner.name} was called!`);
        const { tokens, count } = await this.cw20TokenService.getCw20TokensByOwner(ctx, request);

        return { data: tokens, meta: { count } };
    }
}