import { Injectable } from '@nestjs/common';
import { AkcLogger, RequestContext, TokenMarkets } from '../../../shared';
import { IbcTokenParamsDto } from '../dtos/ibc-token-params.dto';
import { TokenMarketsRepository } from '../../cw20-token/repositories/token-markets.repository';
import { StoreIbcTokenParamsDto } from '../dtos/store-ibc-token-params.dto';

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

  async getCW20Tokens(ctx: RequestContext, req: IbcTokenParamsDto) {
    this.logger.log(ctx, `${this.getIbcTokens.name} was called!`);
    const { result, count } = await this.tokenMarketsRepository.getCW20Tokens(
      req.keyword,
      req.limit,
      req.offset,
    );
    return { result, count };
  }

  async getIbcTokenDetail(ctx: RequestContext, id: number) {
    this.logger.log(ctx, `${this.getIbcTokenDetail.name} was called!`);
    return await this.tokenMarketsRepository.findOne(id);
  }

  async createIbcToken(ctx: RequestContext, req: StoreIbcTokenParamsDto) {
    this.logger.log(ctx, `${this.createIbcToken.name} was called!`);

    const entity = new TokenMarkets();
    entity.denom = req.denom;
    entity.coin_id = req.coin_id;
    entity.name = req.name;
    entity.symbol = req.symbol;
    entity.decimal = req.decimal;
    entity.verify_status = req.verify_status;
    entity.verify_text = req.verify_text;
    try {
      const result = await this.tokenMarketsRepository.save(entity);
      return { data: result, meta: {} };
    } catch (err) {
      this.logger.error(
        ctx,
        `Class ${TokenMarketService.name} call ${this.createIbcToken.name} error ${err?.code} method error: ${err?.stack}`,
      );
    }
  }

  async updateIbcToken(ctx: RequestContext, req: StoreIbcTokenParamsDto) {
    this.logger.log(ctx, `${this.updateIbcToken.name} was called!`);

    const entity = new TokenMarkets();
    entity.denom = req.denom;
    entity.coin_id = req.coin_id;
    entity.name = req.name;
    entity.symbol = req.symbol;
    entity.decimal = req.decimal;
    entity.verify_status = req.verify_status;
    entity.verify_text = req.verify_text;

    try {
      const result = await this.tokenMarketsRepository.update(req.id, entity);
      return { data: result, meta: {} };
    } catch (err) {
      this.logger.error(
        ctx,
        `Class ${TokenMarketService.name} call ${this.updateIbcToken.name} error ${err?.code} method error: ${err?.stack}`,
      );
    }
  }

  async deleteIbcToken(ctx: RequestContext, id: number) {
    this.logger.log(ctx, `${this.deleteIbcToken.name} was called!`);
    try {
      return await this.tokenMarketsRepository.delete(id);
    } catch (err) {
      this.logger.error(
        ctx,
        `Class ${TokenMarketService.name} call ${this.deleteIbcToken.name} error ${err?.code} method error: ${err?.stack}`,
      );
    }
  }
}
