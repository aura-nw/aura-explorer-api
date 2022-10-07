import {
    CacheInterceptor,
    ClassSerializerInterceptor,
    Controller,
    Get,
    HttpStatus,
    Param,
    UseInterceptors
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
    AkcLogger, ReqContext,
    RequestContext
} from '../../../shared';
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
