import {
    Body,
    CacheInterceptor,
    ClassSerializerInterceptor,
    Controller,
    Get,
    HttpStatus,
    Param,
    Post,
    UseInterceptors
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
    AkcLogger, ReqContext,
    RequestContext,
    SwaggerBaseApiResponse
} from '../../../shared';
import { ProposalOutput } from '../dtos/proposal-output.dto';
import { ProposalVoteByOptionInput } from '../dtos/proposal-vote-by-option-input.dto';
import { ProposalVoteByValidatorInput } from '../dtos/proposal-vote-by-validator-input.dto';
import { ProposalService } from '../services/proposal.service';

@ApiTags('proposals')
@Controller('proposals')
export class ProposalController {
  constructor(
    private readonly proposalService: ProposalService,
    private readonly logger: AkcLogger,
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
  async getProposals(@ReqContext() ctx: RequestContext): Promise<any> {
    this.logger.log(ctx, `${this.getProposals.name} was called!`);
    const { proposals, count } = await this.proposalService.getProposals(ctx);

    return { data: proposals, meta: { count } };
  }

  @Get(['list/get-by-address/:address', 'list/get-by-address'])
  @ApiOperation({
    summary: 'Get list proposals by address',
  })
  @ApiResponse({
    status: HttpStatus.OK
  })
  @UseInterceptors(ClassSerializerInterceptor)
  @UseInterceptors(CacheInterceptor)
  async getProposalsByAddress(@ReqContext() ctx: RequestContext, @Param('address') address: string): Promise<any> {
    this.logger.log(ctx, `${this.getProposalsByAddress.name} was called!`);
    const { proposals, count } = await this.proposalService.getProposalsByAddress(ctx, address);

    return { data: proposals, meta: { count } };
  }

  @Get(':proposalId/votes/:voter')
  @ApiOperation({
    summary: 'Get proposal vote by proposal id and voter',
  })
  @ApiResponse({
    status: HttpStatus.OK,
  })
  @UseInterceptors(ClassSerializerInterceptor)
  @UseInterceptors(CacheInterceptor)
  async getProposalVote(
    @ReqContext() ctx: RequestContext,
    @Param('proposalId') proposalId: string,
    @Param('voter') voter: string,
  ): Promise<any> {
    this.logger.log(ctx, `${this.getProposalVote.name} was called!`);
    const proposalVote = await this.proposalService.getProposalVote(
      ctx,
      proposalId,
      voter,
    );

    return { data: proposalVote, meta: {} };
  }

  @Get(':proposalId')
  @ApiOperation({
    summary: 'Get proposal detail by proposalId',
  })
  @ApiResponse({
    status: HttpStatus.OK,
  })
  @UseInterceptors(ClassSerializerInterceptor)
  async getProposalById(
    @ReqContext() ctx: RequestContext,
    @Param('proposalId') proposalId: string,
  ): Promise<any> {
    this.logger.log(ctx, `${this.getProposalById.name} was called!`);
    const proposal = await this.proposalService.getProposalById(
      ctx,
      proposalId,
    );

    return { data: proposal, meta: {} };
  }

  @Get('node/:proposalId')
  @ApiOperation({
    summary: 'Get proposal detail by proposalId (node)',
  })
  @ApiResponse({
    status: HttpStatus.OK,
  })
  @UseInterceptors(ClassSerializerInterceptor)
  async getProposalByIdNode(
    @ReqContext() ctx: RequestContext,
    @Param('proposalId') proposalId: string,
  ): Promise<any> {
    this.logger.log(ctx, `${this.getProposalById.name} was called!`);
    const proposal = await this.proposalService.getProposalByIdNode(
      ctx,
      proposalId,
    );

    return { data: proposal, meta: {} };
  }

  @Post('votes/get-by-option')
  @ApiOperation({
    summary: 'Get votes list by option',
  })
  @ApiResponse({
    status: HttpStatus.OK,
  })
  @UseInterceptors(ClassSerializerInterceptor)
  async getVotesListByOption(
    @ReqContext() ctx: RequestContext,
    @Body() request: ProposalVoteByOptionInput,
  ): Promise<any> {
    this.logger.log(ctx, `${this.getVotesListByOption.name} was called!`);
    const result = await this.proposalService.getVotesListByOption(
      ctx,
      request,
    );

    return { data: result, meta: {} };
  }

  @Post('votes/get-by-validator')
  @ApiOperation({
    summary: 'Get votes list by validator',
  })
  @ApiResponse({
    status: HttpStatus.OK,
  })
  @UseInterceptors(ClassSerializerInterceptor)
  async getVotesListByValidator(
    @ReqContext() ctx: RequestContext,
    @Body() request: ProposalVoteByValidatorInput,
  ): Promise<any> {
    this.logger.log(ctx, `${this.getVotesListByValidator.name} was called!`);
    const result = await this.proposalService.getVotesListByValidator(
      ctx,
      request,
    );

    return { data: result, meta: {} };
  }

  @Get(':proposalId/deposits')
  @ApiOperation({
    summary: 'Get deposit list by proposalId',
  })
  @ApiResponse({
    status: HttpStatus.OK,
  })
  @UseInterceptors(ClassSerializerInterceptor)
  @UseInterceptors(CacheInterceptor)
  async getDepositListById(
    @ReqContext() ctx: RequestContext,
    @Param('proposalId') proposalId: string,
  ): Promise<any> {
    this.logger.log(ctx, `${this.getDepositListById.name} was called!`);
    const result = await this.proposalService.getDepositListById(
      ctx,
      proposalId,
    );

    return { data: result, meta: {} };
  }

  @Get(':proposalId/tally')
  @ApiOperation({
    summary: 'Get tally of proposal vote by proposalId',
  })
  @ApiResponse({
    status: HttpStatus.OK,
  })
  @UseInterceptors(ClassSerializerInterceptor)
  async getProposalVoteTally(
    @ReqContext() ctx: RequestContext,
    @Param('proposalId') proposalId: string,
  ): Promise<any> {
    this.logger.log(ctx, `${this.getProposalVoteTally.name} was called!`);
    const proposalVoteTally = await this.proposalService.getProposalVoteTally(
      ctx,
      proposalId,
    );

    return { data: proposalVoteTally, meta: {} };
  }

  @Get('delegations/:delegatorAddress')
  @ApiOperation({
    summary: 'Get delegations by address',
  })
  @ApiResponse({
    status: HttpStatus.OK,
  })
  @UseInterceptors(ClassSerializerInterceptor)
  @UseInterceptors(CacheInterceptor)
  async getDelegationsByDelegatorAddress(
    @ReqContext() ctx: RequestContext,
    @Param('delegatorAddress') delegatorAddress: string,
  ): Promise<any> {
    const result = await this.proposalService.getDelegationsByDelegatorAddress(
      ctx,
      delegatorAddress
    );
    return { data: result, meta: {} };
  }
}
