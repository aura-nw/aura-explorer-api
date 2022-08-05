import { Body, CacheInterceptor, ClassSerializerInterceptor, Controller, Get, HttpStatus, Param, Post, UseInterceptors } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { AkcLogger, ReqContext, RequestContext } from "../../../shared";
import { Cw721TokenParamsDto } from "../dtos/cw721-token-params.dto";
import { NftParamsDto } from "../dtos/nft-params.dto";
import { Cw721TokenService } from "../services/cw721-token.service";

@ApiTags('cw721-tokens')
@Controller('cw721-tokens')
export class Cw721TokenController {
    constructor(
        private readonly cw721TokenService: Cw721TokenService,
        private readonly logger: AkcLogger,
    ) {
        this.logger.setContext(Cw721TokenController.name);
    }

    @Post()
    @ApiOperation({ summary: 'Get list cw721 tokens' })
    @ApiResponse({ status: HttpStatus.OK })
    @UseInterceptors(ClassSerializerInterceptor)
    @UseInterceptors(CacheInterceptor)
    async getCw721Tokens(@ReqContext() ctx: RequestContext, @Body() request: Cw721TokenParamsDto): Promise<any> {
        this.logger.log(ctx, `${this.getCw721Tokens.name} was called!`);
        const { tokens, count } = await this.cw721TokenService.getCw721Tokens(ctx, request);

        return { data: tokens, meta: { count } };
    }

    @Post(':contractAddress/nfts')
    @ApiOperation({ summary: 'Get list nfts of token' })
    @ApiResponse({ status: HttpStatus.OK })
    @UseInterceptors(ClassSerializerInterceptor)
    @UseInterceptors(CacheInterceptor)
    async getNftsByContractAddress(@ReqContext() ctx: RequestContext, @Param('contractAddress') contractAddress: string, @Body() request: NftParamsDto): Promise<any> {
        this.logger.log(ctx, `${this.getNftsByContractAddress.name} was called!`);
        const { nfts, count } = await this.cw721TokenService.getNftsByContractAddress(ctx, contractAddress, request);

        return { data: nfts, meta: { count } };
    }

    @Get(':contractAddress/nft/:tokenId')
    @ApiOperation({ summary: 'Get nft detail by contract address and token id' })
    @ApiResponse({ status: HttpStatus.OK })
    @UseInterceptors(ClassSerializerInterceptor)
    async getNftByContractAddressAndTokenId(@ReqContext() ctx: RequestContext, @Param('contractAddress') contractAddress: string, @Param('tokenId') tokenId: string): Promise<any> {
        this.logger.log(ctx, `${this.getNftByContractAddressAndTokenId.name} was called!`);
        const nft = await this.cw721TokenService.getNftByContractAddressAndTokenId(ctx, contractAddress, tokenId);

        return { data: nft, meta: {} };
    }
}