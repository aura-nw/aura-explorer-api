import { HttpService } from '@nestjs/axios';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { plainToClass } from 'class-transformer';
import { lastValueFrom } from 'rxjs';

import { AkcLogger, RequestContext } from '../../../shared';

import { ValidatorOutput } from '../dtos/validator-output.dto';

@Injectable()
export class ValidatorService {
  cosmosScanAPI: string;

  constructor(
    private readonly logger: AkcLogger,
    private httpService: HttpService,
    private configService: ConfigService,
  ) {
    this.logger.setContext(ValidatorService.name);
    this.cosmosScanAPI = this.configService.get<string>('cosmosScanAPI')
  }

  async getDataAPI(api, params, ctx) {
    this.logger.log(ctx, `${this.getDataAPI.name} was called, to ${api + params}!`);
    const data = await lastValueFrom(this.httpService.get(api + params)).then(
      (rs) => rs.data,
    );

    return data;
  }

  async getValidators(
    ctx: RequestContext,
  ): Promise<any> {
    // ): Promise<{ validators: ValidatorOutput[]; count: number }> {
    this.logger.log(ctx, `${this.getValidators.name} was called!`);

    const validators = await this.getDataAPI(this.cosmosScanAPI, "/validators", ctx);

    // const validatorsOutput = plainToClass(ValidatorOutput, validators, {
    //   excludeExtraneousValues: true,
    // });

    return {
      validators, count: validators.length
    };
  }

  async getValidatorByAddress(ctx: RequestContext, address: string): Promise<any> {
    this.logger.log(ctx, `${this.getValidatorByAddress.name} was called!`);

    return await this.getDataAPI(this.cosmosScanAPI, "/validator/" + address, ctx);
  }
}
