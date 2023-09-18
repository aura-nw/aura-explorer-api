import { Injectable } from '@nestjs/common';
import { AkcLogger, RequestContext } from '../../../shared';
import { IbcTokenParamsDto } from '../dtos/ibc-token-params.dto';
import { TokenMarketsRepository } from '../../cw20-token/repositories/token-markets.repository';

@Injectable()
export class TokenMarketService {
  constructor(
    private readonly logger: AkcLogger,
    private tokenMarketsRepository: TokenMarketsRepository,
  ) {}

  async getIbcTokens(ctx: RequestContext, req: IbcTokenParamsDto) {
    this.logger.log(ctx, `${this.getIbcTokens.name} was called!`);
    const { result, count } = await this.tokenMarketsRepository.getIbcTokens(
      req.keyword,
      req.limit,
      req.offset,
    );

    return { result, count };
  }
}
