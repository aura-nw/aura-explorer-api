import { Body, CacheInterceptor, ClassSerializerInterceptor, Controller, HttpStatus, Post, UseInterceptors } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { AkcLogger, ReqContext, RequestContext } from "../../../shared";
import { Cw20TokenParamsDto } from "../dtos/cw20-token-params.dto";
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
}