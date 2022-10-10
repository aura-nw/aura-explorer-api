import { EntityRepository, In, Repository } from 'typeorm';

import { Validator } from '../../../shared';

@EntityRepository(Validator)
export class ValidatorRepository extends Repository<Validator> {
  private _getRankBuilder = (alias = 'ranks') => {
    return this.manager.createQueryBuilder().from((qb) => {
      return qb
        .from(Validator, 'v')
        .select('v.*')
        .addSelect(
          `RANK() OVER(ORDER BY
            jailed ASC,
            FIELD(status, 3, 2, 1) ASC,
            power DESC,
            updated_at DESC
          ) as \`rank\``,
        )
        .orderBy('`rank`');
    }, alias);
  };

  async getRankByAddress(address: string) {
    const rankBuilder = this._getRankBuilder()
      .select('ranks.*')
      .where({ operator_address: address });

    return await rankBuilder.getRawOne();
  }

  async getRanks(address: string[]) {
    const rankBuilder = this._getRankBuilder()
      .select('ranks.*')
      .where({ operator_address: In(address) });

    return await rankBuilder.getRawMany();
  }

  async getAllValidators() {
    return await this.createQueryBuilder('v')
      .select('v.*')
      .orderBy('jailed', 'ASC')
      .addOrderBy('FIELD(status, 3, 2, 1)', 'ASC')
      .addOrderBy('power', 'DESC')
      .addOrderBy('updated_at', 'DESC')
      .getRawMany();
  }
}
