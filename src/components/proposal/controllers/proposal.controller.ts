import { ClassSerializerInterceptor, Controller, Get, HttpStatus, Param, UseInterceptors } from "@nestjs/common";
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
    async getProposals(
        @ReqContext() ctx: RequestContext
    ): Promise<any> {
        this.logger.log(ctx, `${this.getProposals.name} was called!`);
        const { proposals, count } = await this.proposalService.getProposals(ctx);

        return { data: proposals, meta: { count } };
    }

    @Get(':proposalId/votes/:voter')
    @ApiOperation({
        summary: 'Get list proposals',
    })
    @ApiResponse({
        status: HttpStatus.OK
    })
    @UseInterceptors(ClassSerializerInterceptor)
    async getProposalVote(
        @ReqContext() ctx: RequestContext,
        @Param('proposalId') proposalId: string,
        @Param('voter') voter: string,
    ): Promise<any> {
        this.logger.log(ctx, `${this.getProposalVote.name} was called!`);
        const proposalVote = await this.proposalService.getProposalVote(ctx, proposalId, voter);

        return { data: proposalVote, meta: {} };
    }
}