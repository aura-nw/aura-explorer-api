import { Injectable, NotFoundException } from '@nestjs/common';
import { IsNull, Not } from 'typeorm';
import { AkcLogger, RequestContext, TokenMarkets } from '../../../shared';
import { TokenMarketsRepository } from '../repositories/token-markets.repository';
import { Cw20TokenMarketParamsDto } from '../dtos/cw20-token-market-params.dto';
import { CreateCw20TokenDto } from '../dtos/create-cw20-token.dto';
import { UpdateCw20TokenDto } from '../dtos/update-cw20-token.dto';
import { CreateIbcDto } from '../dtos/create-ibc.dto';
import { plainToClass } from 'class-transformer';
import { Cw20TokenResponseDto } from '../dtos/cw20-token-response.dto';
import { IbcResponseDto } from '../dtos/ibc-response.dto';
import { UpdateIbcDto } from '../dtos/update-ibc.dto';

@Injectable()
export class Cw20TokenService {
  constructor(
    private readonly logger: AkcLogger,
    private tokenMarketsRepository: TokenMarketsRepository,
  ) {
    this.logger.setContext(Cw20TokenService.name);
  }

  async getTokenMarket(
    ctx: RequestContext,
    query: Cw20TokenMarketParamsDto,
  ): Promise<TokenMarkets[]> {
    this.logger.log(ctx, `${this.getTokenMarket.name} was called!`);
    if (query.contractAddress) {
      return await this.tokenMarketsRepository.find({
        where: [
          { contract_address: query.contractAddress },
          { denom: query.contractAddress },
        ],
      });
    } else if (query.onlyIbc === 'true') {
      return await this.tokenMarketsRepository.find({
        where: { denom: Not(IsNull()) },
      });
    } else {
      return await this.tokenMarketsRepository.find();
    }
  }

  async create(
    createTokenMarketsDto: CreateCw20TokenDto | CreateIbcDto,
    returnType: typeof Cw20TokenResponseDto | typeof IbcResponseDto,
  ): Promise<Cw20TokenResponseDto | IbcResponseDto> {
    const newTokenMarket = await this.tokenMarketsRepository.save(
      createTokenMarketsDto,
    );

    return plainToClass(returnType, newTokenMarket);
  }

  async update(
    id: number,
    updateTokenMarketsDto: UpdateCw20TokenDto | UpdateIbcDto,
    returnType: typeof Cw20TokenResponseDto | typeof IbcResponseDto,
  ): Promise<Cw20TokenResponseDto | IbcResponseDto> {
    const foundTokenMarkets = await this.tokenMarketsRepository.findOne({
      where: { id },
    });

    if (foundTokenMarkets) {
      updateTokenMarketsDto.id = foundTokenMarkets.id;

      await this.tokenMarketsRepository.merge(
        foundTokenMarkets,
        updateTokenMarketsDto,
      );
      await this.tokenMarketsRepository.save(foundTokenMarkets);

      return plainToClass(returnType, foundTokenMarkets);
    } else {
      throw new NotFoundException();
    }
  }

  async remove(id: number): Promise<void> {
    const foundTokenMarkets = await this.tokenMarketsRepository.findOne({
      where: { id },
    });

    if (!foundTokenMarkets) {
      throw new NotFoundException();
    }

    await this.tokenMarketsRepository.delete(id);
  }
}
