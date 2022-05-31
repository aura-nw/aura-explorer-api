import { Body, CacheInterceptor, ClassSerializerInterceptor, Controller, Get, HttpStatus, Post, UseInterceptors } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { AkcLogger, ReqContext, RequestContext } from "../../../shared";
import { ContractParamsDto } from "../dtos/contract-params.dto";
import { ContractService } from "../services/contract.service";

@ApiTags('contracts')
@Controller('contracts')
export class ContractController {
    constructor(
        private readonly contractService: ContractService,
        private readonly logger: AkcLogger,
    ) {
        this.logger.setContext(ContractController.name);
    }

    @Post()
    @ApiOperation({ summary: 'Get list contracts' })
    @ApiResponse({ status: HttpStatus.OK })
    @UseInterceptors(ClassSerializerInterceptor)
    @UseInterceptors(CacheInterceptor)
    async getContracts(@ReqContext() ctx: RequestContext, @Body() request: ContractParamsDto): Promise<any> {
        this.logger.log(ctx, `${this.getContracts.name} was called!`);
        const { contracts, count } = await this.contractService.getContracts(ctx, request);

        return { data: contracts, meta: { count } };
    }
}