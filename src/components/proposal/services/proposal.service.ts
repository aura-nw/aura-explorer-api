import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DelegationRepository } from '../../validator/repositories/delegation.repository';
import {
  AkcLogger,
  RequestContext
} from '../../../shared';

@Injectable()
export class ProposalService {
  isSync = false;

  constructor(
    private readonly logger: AkcLogger,
    private configService: ConfigService,
    private delegationRepository: DelegationRepository
  ) {
    this.logger.setContext(ProposalService.name);
  }


  async getDelegationsByDelegatorAddress(
    ctx: RequestContext,
    delegatorAddress: string,
  ): Promise<any> {
    this.logger.log(ctx, `${this.getDelegationsByDelegatorAddress.name} was called!`);
    //get delegation first
    let result: any = {};
    result = await this.delegationRepository.findOne({
      where: { delegator_address: delegatorAddress },
      order: { created_at: 'ASC' }
    });
    const stakeData = await this.delegationRepository.find({
      where: { delegator_address: delegatorAddress }
    });
    if (stakeData.length > 0 && stakeData.reduce((a, curr) => a + curr.amount, 0) <= 0) {
      result = {};
    }

    return { result: result };
  }
}
