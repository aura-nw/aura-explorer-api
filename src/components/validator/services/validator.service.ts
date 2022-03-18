import { HttpService } from '@nestjs/axios';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { plainToClass } from 'class-transformer';
import { lastValueFrom } from 'rxjs';
import { DelegationRepository } from 'src/components/schedule/repositories/delegation.repository';
import { BlockService } from '../../../components/block/services/block.service';

import { AkcLogger, RequestContext } from '../../../shared';
import { DelegationParamsDto } from '../dtos/delegation-params.dto';

import { DelegationOutput, LiteValidatorOutput, ValidatorOutput } from '../dtos/validator-output.dto';
import { ValidatorRepository } from '../repositories/validator.repository';

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

    let cntValidatorActive = 0;
    const validatorActive = validatorsOutput.filter(e => e.jailed !== '0');
    for (const key in validatorActive) {
      const data = validatorActive[key];
      const dataBefore = validatorActive[parseInt(key) - 1]
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
    for (const key in validatorsOutput) {
      const data = validatorsOutput[key];
      data.rank = parseInt(key) + 1;
      if (data.jailed === '0') {
        data.status_validator = true;
        cntValidatorActive = cntValidatorActive + 1;
      } else {
        data.status_validator = false;
      }
    }

    return { validators: validatorsOutput, count };
  }
  
  async getValidatorByAddress(ctx: RequestContext, address): Promise<any> {
    this.logger.log(ctx, `${this.getValidatorByAddress.name} was called!`);

    const validatorOutput = await this.validatorRepository.findOne({
      where: { operator_address: address },
    });

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
