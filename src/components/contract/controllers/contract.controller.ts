import { Body, CacheInterceptor, ClassSerializerInterceptor, Controller, Get, HttpStatus, Param, Post, Query, UseInterceptors } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { AkcLogger, ReqContext, RequestContext } from "../../../shared";
import { ContractByCreatorParamsDto } from "../dtos/contract-by-creator-params.dto";
import { ContractParamsDto } from "../dtos/contract-params.dto";
import { SearchTransactionParamsDto } from "../dtos/search-transaction-params.dto";
import { VerifyContractParamsDto } from "../dtos/verify-contract-params.dto";
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

    @Get('get-smart-contract-status')
    @ApiOperation({ summary: 'Get list smart contract status' })
    @ApiResponse({ status: HttpStatus.OK })
    @UseInterceptors(ClassSerializerInterceptor)
    getSmartContractStatus() {
        const status = this.contractService.getSmartContractStatus();
        return { data: status, meta: {} };
    }

    @Get('get-contract-by-creator')
    @ApiOperation({ summary: 'Get list smart contract by creator address' })
    @ApiResponse({ status: HttpStatus.OK })
    @UseInterceptors(ClassSerializerInterceptor)
    async getContractByCreator(@ReqContext() ctx: RequestContext, @Query() req: ContractByCreatorParamsDto) {
        const [constracts, count] = await this.contractService.getContractByCreator(ctx, req);
        return { data: constracts, meta: { count } };
    }

    @Get(':contractAddress')
    @ApiOperation({ summary: 'Get contract detail by contract address' })
    @ApiResponse({ status: HttpStatus.OK })
    @UseInterceptors(ClassSerializerInterceptor)
    async getContractByAddress(@ReqContext() ctx: RequestContext, @Param('contractAddress') contractAddress: string): Promise<any> {
        this.logger.log(ctx, `${this.getContractByAddress.name} was called!`);
        const proposal = await this.contractService.getContractByAddress(ctx, contractAddress);

        return { data: proposal, meta: {} };
    }

    @Get('tag/:accountAddress/:contractAddress')
    @ApiOperation({ summary: 'Get tag by account address and contract address' })
    @ApiResponse({ status: HttpStatus.OK })
    @UseInterceptors(ClassSerializerInterceptor)
    async getTagByAddress(@ReqContext() ctx: RequestContext,
        @Param('accountAddress') accountAddress: string,
        @Param('contractAddress') contractAddress: string
    ): Promise<any> {
        this.logger.log(ctx, `${this.getTagByAddress.name} was called!`);
        const proposal = await this.contractService.getTagByAddress(ctx, accountAddress, contractAddress);

        return { data: proposal, meta: {} };
    }

    @Post('verify-contract')
    @ApiOperation({ summary: 'Verify contract' })
    @ApiResponse({ status: HttpStatus.OK })
    @UseInterceptors(ClassSerializerInterceptor)
    @UseInterceptors(CacheInterceptor)
    async verifyContract(@ReqContext() ctx: RequestContext, @Body() request: VerifyContractParamsDto): Promise<any> {
        this.logger.log(ctx, `${this.verifyContract.name} was called!`);
        const result = await this.contractService.verifyContract(ctx, request);

        return { data: result, meta: {} };
    }

    @Get('match-creation-code/:contractAddress')
    @ApiOperation({ summary: 'Get list contracts match creation code' })
    @ApiResponse({ status: HttpStatus.OK })
    @UseInterceptors(ClassSerializerInterceptor)
    async getContractsMatchCreationCode(@ReqContext() ctx: RequestContext,
        @Param('contractAddress') contractAddress: string
    ): Promise<any> {
        this.logger.log(ctx, `${this.getContractsMatchCreationCode.name} was called!`);
        const { contracts, count } = await this.contractService.getContractsMatchCreationCode(ctx, contractAddress);

        return { data: contracts, meta: { count } };
    }

    @Post('search-transactions')
    @ApiOperation({ summary: 'Get contract transactions' })
    @ApiResponse({ status: HttpStatus.OK })
    @UseInterceptors(ClassSerializerInterceptor)
    @UseInterceptors(CacheInterceptor)
    async searchTransactions(@ReqContext() ctx: RequestContext, @Body() request: SearchTransactionParamsDto): Promise<any> {
        this.logger.log(ctx, `${this.searchTransactions.name} was called!`);
        const { transactions, count } = await this.contractService.searchTransactions(ctx, request);

        return { data: transactions, meta: { count } };
    }

    @Get('verify/status/:contractAddress')
    @ApiOperation({ summary: 'Verify contract status' })
    @ApiResponse({ status: HttpStatus.OK })
    @UseInterceptors(ClassSerializerInterceptor)
    @UseInterceptors(CacheInterceptor)
    async verifyContractStatus(@ReqContext() ctx: RequestContext, @Param('contractAddress') contractAddress: string): Promise<any> {
        this.logger.log(ctx, `${this.verifyContractStatus.name} was called!`);
        const result = await this.contractService.verifyContractStatus(ctx, contractAddress);

        return { data: result, meta: {} };
    }

    @Get('get-code-ids/:creatorAddress')
    @ApiOperation({ summary: 'Get list code id of contract' })
    @ApiResponse({ status: HttpStatus.OK })
    @UseInterceptors(ClassSerializerInterceptor)
    async getCodeIds(@ReqContext() ctx: RequestContext, @Param('creatorAddress') creatorAddress: string) {
        const codeIds: Array<number> = await this.contractService.getCodeIds(ctx, creatorAddress);
        return { data: codeIds, meta: {} };
    }
}