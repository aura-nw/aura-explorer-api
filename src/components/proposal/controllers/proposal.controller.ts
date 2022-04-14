import { CacheInterceptor, ClassSerializerInterceptor, Controller, Get, HttpStatus, Param, UseInterceptors } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { AkcLogger, BaseApiResponse, ReqContext, RequestContext, SwaggerBaseApiResponse } from "../../../shared";
import { ProposalOutput } from "../dtos/proposal-output.dto";
import { ProposalService } from "../services/proposal.service";

@ApiTags('proposals')
@Controller('proposals')
export class ProposalController {
    constructor(
        private readonly proposalService: ProposalService,
        private readonly logger: AkcLogger
    ) {
        this.logger.setContext(ProposalController.name);
    }

    @Get()
    @ApiOperation({
        summary: 'Get list proposals',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        type: SwaggerBaseApiResponse(ProposalOutput),
    })
    @UseInterceptors(ClassSerializerInterceptor)
    @UseInterceptors(CacheInterceptor)
    async getProposals(
        @ReqContext() ctx: RequestContext
    ): Promise<any> {
        this.logger.log(ctx, `${this.getProposals.name} was called!`);
        const { proposals, count } = await this.proposalService.getProposals(ctx);

        return { data: proposals, meta: { count } };
    }

    @Get(':proposalId/votes/:voter')
    @ApiOperation({
        summary: 'Get proposal vote by proposal id and voter',
    })
    @ApiResponse({
        status: HttpStatus.OK
    })
    @UseInterceptors(ClassSerializerInterceptor)
    @UseInterceptors(CacheInterceptor)
    async getProposalVote(
        @ReqContext() ctx: RequestContext,
        @Param('proposalId') proposalId: string,
        @Param('voter') voter: string,
    ): Promise<any> {
        this.logger.log(ctx, `${this.getProposalVote.name} was called!`);
        const proposalVote = await this.proposalService.getProposalVote(ctx, proposalId, voter);

        return { data: proposalVote, meta: {} };
    }

    @Get(':proposalId')
    @ApiOperation({
        summary: 'Get proposal detail by proposalId',
    })
    @ApiResponse({
        status: HttpStatus.OK
    })
    @UseInterceptors(ClassSerializerInterceptor)
    async getProposalById(
        @ReqContext() ctx: RequestContext,
        @Param('proposalId') proposalId: string,
    ): Promise<any> {
        this.logger.log(ctx, `${this.getProposalById.name} was called!`);
        const proposal = await this.proposalService.getProposalById(ctx, proposalId);

        return { data: proposal, meta: { } };
    }

    @Get(':proposalId/votes')
    @ApiOperation({
        summary: 'Get votes list by proposalId',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        type: SwaggerBaseApiResponse(ProposalOutput),
    })
    @UseInterceptors(ClassSerializerInterceptor)
    async getVotesListById(
        @ReqContext() ctx: RequestContext,
        @Param('proposalId') proposalId: string,
    ): Promise<any> {
        this.logger.log(ctx, `${this.getVotesListById.name} was called!`);
        const proposalsVotes = await this.proposalService.getVotesListById(ctx, proposalId);

        return { data: proposalsVotes, meta: { } };
    }

    @Get(':proposalId/deposits')
    @ApiOperation({
        summary: 'Get deposit list by proposalId',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        type: SwaggerBaseApiResponse(ProposalOutput),
    })
    @UseInterceptors(ClassSerializerInterceptor)
    @UseInterceptors(CacheInterceptor)
    async getDepositListById(
        @ReqContext() ctx: RequestContext,
        @Param('proposalId') proposalId: string,
    ): Promise<any> {
        this.logger.log(ctx, `${this.getDepositListById.name} was called!`);
        const proposalsDeposit = await this.proposalService.getDepositListById(ctx, proposalId);

        return { data: proposalsDeposit, meta: { } };
    }

}