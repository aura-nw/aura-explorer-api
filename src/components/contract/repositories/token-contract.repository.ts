import { InjectRepository } from '@nestjs/typeorm';
import {
  EntityRepository,
  FindManyOptions,
  Not,
  ObjectLiteral,
  Raw,
  Repository,
} from 'typeorm';

import { AURA_INFO, CONTRACT_TYPE, TokenContract } from '../../../shared';

@EntityRepository(TokenContract)
export class TokenContractRepository extends Repository<TokenContract> {
  constructor(
    @InjectRepository(TokenContract)
    private readonly repos: Repository<ObjectLiteral>,
  ) {
    super();
  }

  async getDataTokens(
    type: CONTRACT_TYPE,
    keyword: string,
    limit: number,
    offset: number,
  ) {
    const condition: FindManyOptions<TokenContract> = {
      where: {
        type: type,
        contract_address: Not(AURA_INFO.CONNTRACT_ADDRESS),
      },
      order: { circulating_market_cap: 'DESC', updated_at: 'DESC' },
    };

    if (keyword) {
      condition.where = [
        {
          type: type,
          ...(keyword && {
            contract_address: Raw(
              () => ` LOWER(contract_address) LIKE :keyword`,
              { keyword: `%${keyword}%`.toLowerCase() },
            ),
          }),
        },
        {
          type: type,
          ...(keyword && {
            contract_address: Raw(() => ` LOWER(name) LIKE :keyword`, {
              keyword: `%${keyword}%`.toLowerCase(),
            }),
          }),
        },
      ];
    }
    if (limit > 0) {
      condition['take'] = limit;
      condition['skip'] = offset;
    }
    const [tokens, count] = await this.findAndCount(condition);
    return [tokens, count];
  }
}
