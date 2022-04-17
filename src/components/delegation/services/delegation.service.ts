import { HttpService } from '@nestjs/axios';
import { Get, Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { plainToClass } from 'class-transformer';
import { ServiceUtil } from '../../../shared/utils/service.util';
import { AkcLogger, RequestContext } from '../../../shared';
import { RedelegationsOutput } from '../dtos/redelegations-output';
import { number } from 'joi';
import { DelegationRepository } from '../repositories/delegation.repository';


@Injectable()
export class DelegationService {
  cosmosScanAPI: string;
  api: string;

  constructor(
    private readonly logger: AkcLogger,
    private httpService: HttpService,
    private configService: ConfigService,
    private serviceUtil: ServiceUtil,
    private delegationRepos: DelegationRepository
  ) {
    this.logger.setContext(DelegationService.name);
    this.cosmosScanAPI = this.configService.get<string>('cosmosScanAPI');
    this.api = this.configService.get<string>('node.api');
  }

  /**
   * redelegations
   * @param ctx 
   * @param delegatorAddr 
   */
  async redelegations( ctx: RequestContext, delegatorAddr: string ){
    this.logger.log(ctx, `${this.redelegations.name} was called!`);
    const api = this.configService.get<string>('node.api');
    const params = `/cosmos/staking/v1beta1/delegators/${delegatorAddr}/redelegations`;

    const redelegationsRespones: Array<RedelegationsOutput> = [];

    const redelegationsRes = await this.serviceUtil.getDataAPI(api, params, ctx);
    if(redelegationsRes){
      const redelegationsOutput = new RedelegationsOutput();
    }
  }

  /**
   * getDelegators
   * @param delegatorAddr 
   */
  async getDelegators(delegatorAddr: string ){
    this.logger.log(null, `${this.getDelegators.name} was called!`);
    
  }
  
}
