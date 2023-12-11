import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityRepository, ObjectLiteral, Repository } from 'typeorm';
import { TokenMarkets } from '../../../shared';

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

  async countCw20TokensHavingCoinId() {
    const sqlSelect = `tm.contract_address, tm.coin_id`;

    const queryBuilder = this.createQueryBuilder('tm')
      .select(sqlSelect)
      .where("tm.coin_id <> '' ");

    return await queryBuilder.getCount();
  }

  async getCw20TokenMarketsHavingCoinId(limit: number, pageIndex: number) {
    const sqlSelect = ` tm.coin_id`;

    const queryBuilder = this.createQueryBuilder('tm')
      .select(sqlSelect)
      .where("tm.coin_id <> '' ")
      .limit(limit)
      .offset(pageIndex * limit);

    return await queryBuilder.getRawMany();
  }
}
