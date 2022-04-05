import { EntityRepository, Repository } from 'typeorm';

import { Validator } from '../../../shared';

@EntityRepository(Validator)
export class ValidatorRepository extends Repository<Validator> {

    async getRankByAddress(address: string) {
        return await this.query(`
            SELECT * FROM (
                SELECT *,
                RANK() OVER(ORDER BY power DESC) as 'rank'
                FROM validators 
            ) SUB
            WHERE SUB.operator_address = ?`, [address]
        ).then(t=> t[0]);
   }
}
