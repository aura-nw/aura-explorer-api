import { HttpService } from '@nestjs/axios';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { plainToClass } from 'class-transformer';
import { lastValueFrom } from 'rxjs';
import { BlockRepository } from '../../../components/block/repositories/block.repository';
import { DelegationRepository } from '../../../components/schedule/repositories/delegation.repository';
import { BlockService } from '../../../components/block/services/block.service';

import { AkcLogger, CONST_NUM, RequestContext } from '../../../shared';
import { DelegationParamsDto } from '../dtos/delegation-params.dto';

import { DelegationOutput, LiteValidatorOutput, ValidatorOutput } from '../dtos/validator-output.dto';
import { ValidatorRepository } from '../repositories/validator.repository';
import { ProposalRepository } from '../../../components/proposal/repositories/proposal.repository';
import { ProposalVoteRepository } from '../../../components/proposal/repositories/proposal-vote.repository';

@Injectable()
export class ValidatorService {
  cosmosScanAPI: string;
  api: string;

  constructor(
    private readonly logger: AkcLogger,
    private httpService: HttpService,
    private configService: ConfigService,
    private blockService: BlockService,
    private validatorRepository: ValidatorRepository,
    private delegationRepository: DelegationRepository,
    private blockRepository: BlockRepository,
    private proposalRepository: ProposalRepository,
    private proposalVoteRepository: ProposalVoteRepository,
  ) {
    this.logger.setContext(ValidatorService.name);
    this.cosmosScanAPI = this.configService.get<string>('cosmosScanAPI');
    this.api = this.configService.get<string>('node.api');
  }

  async getDataAPI(api, params, ctx) {
    this.logger.log(
      ctx,
      `${this.getDataAPI.name} was called, to ${api + params}!`,
    );
    const data = await lastValueFrom(this.httpService.get(api + params)).then(
      (rs) => rs.data,
    );

    return data;
  }

  async getTotalValidator(): Promise<number> {
    return await this.validatorRepository.count();
  }

  async getTotalValidatorActive(): Promise<number> {
    return await this.validatorRepository.count({ where: { jailed: '0' } });
  }

  async getValidators(ctx: RequestContext
    ): Promise<{ validators: LiteValidatorOutput[]; count: number }> {
    this.logger.log(ctx, `${this.getValidators.name} was called!`);
  
    // get all validator
    const [validatorsRes, count] = await this.validatorRepository.findAndCount({
      order: { power: 'DESC' },
    });

    const validatorsOutput = plainToClass(LiteValidatorOutput, validatorsRes, {
      excludeExtraneousValues: true,
    });

    // get 50 proposals
    const countProposal = await this.proposalRepository.count({
      order: {pro_id: 'DESC'},
      take: CONST_NUM.LIMIT_50,
      skip: CONST_NUM.OFFSET,
    });

    let cntValidatorActive = 0;
    const validatorActive = validatorsOutput.filter(e => e.jailed !== '0');
    for (let key in validatorActive) {
      const data = validatorActive[key];
      const dataBefore = validatorActive[parseInt(key) - 1];
      if (parseInt(key) === 0) {
        data.cumulative_share_before = '0.00';
        data.cumulative_share = data.percent_power;
        data.cumulative_share_after = data.percent_power;
      } else {
        data.cumulative_share_before = dataBefore.cumulative_share_after;
        data.cumulative_share = data.percent_power;
        const cumulative = parseFloat(data.cumulative_share_before) + parseFloat(data.percent_power);
        data.cumulative_share_after = cumulative.toFixed(2);
      }
    }
    for (let key in validatorsOutput) {
      const data = validatorsOutput[key];
      data.rank = parseInt(key) + 1;
      data.target_count = countProposal;
      if (data.jailed === '0') {
        data.status_validator = true;
        cntValidatorActive = cntValidatorActive + 1;
      } else {
        data.status_validator = false;
      }
      
      // get count proposal vote by address
      const countVotes = await this.proposalVoteRepository.count({
        where: { voter: data.acc_address },
      });
      data.vote_count = countVotes;
    }

    return { validators: validatorsOutput, count };
  }
  
  async getValidatorByAddress(ctx: RequestContext, address): Promise<any> {
    this.logger.log(ctx, `${this.getValidatorByAddress.name} was called!`);

    const validator = await this.validatorRepository.findOne({
      where: { operator_address: address },
    });

    const validatorOutput = plainToClass(ValidatorOutput, validator, {
      excludeExtraneousValues: true,
    });
    
    const blockFirst =  await this.blockRepository.find({
      where: { operator_address: address },
      order: { height: 'ASC' },
      take: 1,
      skip: 0,
    });

    if (blockFirst.length > 0) {
      validatorOutput.bonded_height = blockFirst[0].height;
    }

    return validatorOutput;
  }

  async getDelegationByAddress(
    ctx: RequestContext,
    validatorAddress,
    query: DelegationParamsDto,
  ): Promise<{ delegations: DelegationOutput[]; count: number }> {
    this.logger.log(ctx, `${this.getValidatorByAddress.name} was called!`);

    const [delegations, count]  = await this.delegationRepository.findAndCount({
      where: { validator_address: validatorAddress },
      order: { amount: 'DESC' },
      take: query.limit,
      skip: query.offset,
    });

    const delegationsOutput = plainToClass(DelegationOutput, delegations, {
      excludeExtraneousValues: true,
    });

    return { delegations: delegationsOutput, count };
  }
}
