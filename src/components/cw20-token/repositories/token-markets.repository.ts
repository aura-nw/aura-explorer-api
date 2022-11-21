import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityRepository, ObjectLiteral, Repository } from 'typeorm';
import { TokenMarkets } from '../../../shared';
import { Cw20TokenParamsDto } from '../dtos/cw20-token-params.dto';

@EntityRepository(TokenMarkets)
export class TokenMarketsRepository extends Repository<TokenMarkets> {
  private readonly _logger = new Logger(TokenMarketsRepository.name);
  constructor(
    @InjectRepository(TokenMarkets)
    private readonly repos: Repository<ObjectLiteral>,
  ) {
    super();
    this._logger.log(
      '============== Constructor TokenMarkets Repository ==============',
    );
  }

  async getCw20TokenMarkets(request: Cw20TokenParamsDto) {
    const sqlSelect = `*`;

    const queryBuilder = this.createQueryBuilder()
      .select(sqlSelect)
      .where(`coin_id NOT IN ('bitcoin','aura-network')`)
      .andWhere(
        '(LOWER(name) LIKE :keyword OR LOWER(contract_address) LIKE :keyword)',
        {
          keyword: `%${(request.keyword || '').toLowerCase()}%`,
        },
      )

      .limit(request.limit)
      .offset(request.offset)
      .orderBy(
        request?.sort_column && request?.sort_order
          ? {
              [`${request.sort_column}`]:
                request.sort_order.toLowerCase() === 'asc' ? 'ASC' : 'DESC',
            }
          : { circulating_market_cap: 'DESC' },
      );

    const list = await queryBuilder.getRawMany();
    const count = await queryBuilder.getCount();

    return { list, count };
  }
}
