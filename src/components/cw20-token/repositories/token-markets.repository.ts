import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityRepository, ObjectLiteral, Repository } from 'typeorm';
import { CONTRACT_CODE_RESULT, TokenMarkets } from '../../../shared';
import { SmartContractCode } from '../../../shared/entities/smart-contract-code.entity';
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
    const sqlSelect = `tm.*`;

    const queryBuilder = this.createQueryBuilder('tm')
      .select(sqlSelect)
      .innerJoin(
        SmartContractCode,
        'smc',
        `smc.code_id = tm.code_id AND smc.result='${CONTRACT_CODE_RESULT.CORRECT}' `,
      )
      .where(`tm.coin_id NOT IN ('bitcoin','aura-network')`)
      .andWhere(
        '(LOWER(tm.name) LIKE :keyword OR LOWER(tm.contract_address) LIKE :keyword)',
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
              updated_at: 'DESC',
            }
          : { circulating_market_cap: 'DESC', updated_at: 'DESC' },
      );

    const list = await queryBuilder.getRawMany();
    const count = await queryBuilder.getCount();

    return { list, count };
  }

  async countCw20TokensHavingCoinId() {
    const sqlSelect = `tm.contract_address, tm.coin_id`;

    const queryBuilder = this.createQueryBuilder('tm')
      .select(sqlSelect)
      .where("tm.coin_id <> '' ")
      .andWhere("tm.coin_id <> 'aura-network' ");

    return await queryBuilder.getCount();
  }

  async getCw20TokenMarketsHavingCoinId(limit: number, pageIndex: number) {
    const sqlSelect = ` tm.coin_id`;

    const queryBuilder = this.createQueryBuilder('tm')
      .select(sqlSelect)
      .where("tm.coin_id <> '' ")
      .andWhere("tm.coin_id <> 'aura-network' ")
      .limit(limit)
      .offset(pageIndex * limit);

    return await queryBuilder.getRawMany();
  }
}
