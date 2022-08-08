import { EntityRepository, Repository } from 'typeorm';

import { Validator } from '../../../shared';

@EntityRepository(Validator)
export class ValidatorRepository extends Repository<Validator> {

    async getRankByAddress(address: string) {
        return await this.query(`
            SELECT * FROM (
                SELECT *,
                RANK() OVER(ORDER BY FIELD(status, 3, 1, 2), jailed ASC, power DESC, updated_at DESC) as 'rank'
                FROM validators ORDER BY FIELD(status, 3, 1, 2), jailed ASC, power DESC, updated_at DESC
            ) SUB
            WHERE SUB.operator_address = ?`, [address]
        ).then(t => t[0]);
    }

    /**
     * getDelegators
     * @param operatorAddress 
     * @param delegatorAddress 
     * @returns 
     */
    async getDelegators(operatorAddr: string, delegatorAddr: string) {
        const sql = `SELECT val.title, val.operator_address, val.acc_address, val.commission, val.status, val.jailed, joinDel.isStaking
                        FROM validators val 
                        LEFT OUTER JOIN (
                                SELECT del.delegator_address AS staking_address, del.validator_address,
                                (CASE WHEN IFNULL(SUM(amount), 0) > 0 THEN 1 ELSE 0 END) isStaking
                                FROM delegations del
                                where del.delegator_address=?
                                GROUP BY del.delegator_address, del.validator_address
                            ) joinDel on joinDel.validator_address = val.operator_address
                        WHERE val.operator_address!=? AND val.status=3 ORDER BY joinDel.isStaking DESC, val.percent_power DESC`;
        return await this.query(sql, [delegatorAddr, operatorAddr]);
    }

    /**
     * getDelegatorByValidatorAddr
     * @param validatorAddress 
     * @param limit 
     * @param offset 
     * @returns 
     */
    async getDelegatorByValidatorAddr(validatorAddress: string, limit: number, offset: number){
        offset = limit * offset;
        const sqlSelect = `SELECT delegator_address, SUM(Amount) AS amount FROM delegations WHERE validator_address=? GROUP BY delegator_address HAVING SUM(Amount) > 0 ORDER BY SUM(Amount) DESC LIMIT ${limit} OFFSET ${offset}`;
        const sqlCount = `SELECT COUNT(1) AS total FROM (SELECT COUNT(1) AS total FROM delegations WHERE validator_address=? GROUP BY delegator_address HAVING SUM(Amount) > 0) tbCount`;
        const pageResults = await this.query(sqlSelect, [validatorAddress]);
        const count = await this.query(sqlCount, [validatorAddress]).then(t => t[0]);
        return {pageResults, total: count.total};
    }

    async getValidators() {
        const sql = `SELECT * FROM validators ORDER BY FIELD(status, 3, 1, 2), jailed ASC, power DESC, updated_at DESC`;
        return await this.query(sql, []);
    }
}
