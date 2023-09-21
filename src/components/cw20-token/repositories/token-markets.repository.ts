import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Brackets,
  EntityRepository,
  IsNull,
  Not,
  ObjectLiteral,
  Repository,
} from 'typeorm';
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

  /**
   * Get list name tags
   * @param keyword
   * @param limit
   * @param offset
   * @returns
   */
  async getIbcTokens(keyword: string, limit: number, offset: number) {
    this._logger.log(
      `============== ${this.getIbcTokens.name} was called! ==============`,
    );
    const builder = this.createQueryBuilder('ibc_tokens')
      .select(
        `ibc_tokens.id,
        ibc_tokens.denom,
        ibc_tokens.coin_id,
        ibc_tokens.symbol,
        ibc_tokens.name,
        ibc_tokens.image,
        ibc_tokens.verify_status,
        ibc_tokens.verify_text,
        ibc_tokens.decimal,
        ibc_tokens.created_at`,
      )
      .where({ denom: Not(IsNull()) });
    const _finalizeResult = async () => {
      const result = await builder
        .limit(limit)
        .offset(offset)
        .orderBy('ibc_tokens.updated_at', 'DESC')
        .getRawMany();

      const count = await builder.getCount();
      return { result, count };
    };

    if (keyword) {
      builder.andWhere(
        new Brackets((qb) => {
          qb.where('LOWER(ibc_tokens.denom) LIKE LOWER(:keyword)', {
            keyword: `%${keyword}%`,
          }).orWhere('ibc_tokens.name LIKE :keyword', {
            keyword: `%${keyword}%`,
          });
        }),
      );
    }

    return await _finalizeResult();
  }

  /**
   * Get list name tags
   * @param keyword
   * @param limit
   * @param offset
   * @returns
   */
  async getCW20Tokens(keyword: string, limit: number, offset: number) {
    this._logger.log(
      `============== ${this.getIbcTokens.name} was called! ==============`,
    );
    const builder = this.createQueryBuilder('cw20_tokens')
      .select(
        `cw20_tokens.id,
        cw20_tokens.contract_address,
        cw20_tokens.coin_id,
        cw20_tokens.image,
        cw20_tokens.verify_status,
        cw20_tokens.verify_text,
        cw20_tokens.created_at`,
      )
      .where({ contract_address: Not(IsNull()) });
    const _finalizeResult = async () => {
      const result = await builder
        .limit(limit)
        .offset(offset)
        .orderBy('cw20_tokens.updated_at', 'DESC')
        .getRawMany();

      const count = await builder.getCount();
      return { result, count };
    };

    if (keyword) {
      builder.andWhere(
        new Brackets((qb) => {
          qb.where('LOWER(cw20_tokens.contract_address) LIKE LOWER(:keyword)', {
            keyword: `%${keyword}%`,
          }).orWhere('cw20_tokens.coin_id LIKE :keyword', {
            keyword: `%${keyword}%`,
          });
        }),
      );
    }

    return await _finalizeResult();
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
