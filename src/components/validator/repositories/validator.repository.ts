import { EntityRepository, Repository } from 'typeorm';

import { Validator } from '../../../shared';

@EntityRepository(Validator)
export class ValidatorRepository extends Repository<Validator> {

    async getRankByAddress(address: string) {
        return await this.query(`
            SELECT * FROM (
                SELECT *,
                RANK() OVER(ORDER BY jailed ASC, FIELD(status, 3, 2, 1), power DESC, updated_at DESC) as 'rank'
                FROM validators ORDER BY jailed ASC, FIELD(status, 3, 2, 1), power DESC, updated_at DESC
            ) SUB
            WHERE SUB.operator_address = ?`, [address]
        ).then(t => t[0]);
    }

    async getRanks(address: string[]) {
        return await this.query(`
            SELECT * FROM (
                SELECT *,
                RANK() OVER(ORDER BY jailed ASC, FIELD(status, 3, 2, 1), power DESC, updated_at DESC) as 'rank'
                FROM validators ORDER BY jailed ASC, FIELD(status, 3, 2, 1), power DESC, updated_at DESC
            ) SUB
            WHERE SUB.operator_address in (?)`, [address]
        );
    }

    async getValidators() {
        const sql = `SELECT * FROM validators ORDER BY jailed ASC, FIELD(status, 3, 2, 1), power DESC, updated_at DESC`;
        return await this.query(sql, []);
    }
}
