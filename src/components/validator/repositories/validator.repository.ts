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
        ).then(t => t[0]);
    }

  
    /**
     * getDelegators
     * @param operatorAddress 
     * @param delegatorAddress 
     * @returns 
     */
    async getDelegators(operatorAddr: string, delegatorAddr: string) {
        const sql = `SELECT val.title, val.operator_address, val.acc_address, val.commission, val.status, val.jailed,
                    (SELECT del.delegator_address FROM delegations del WHERE del.delegator_address=? AND del.validator_address = val.operator_address limit 1) AS staking_address
            FROM validators val WHERE val.OPERATOR_ADDRESS!=? AND val.status=3`;
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
        limit = (offset === 0)? limit : limit * offset;
        const sqlSelect = `SELECT delegator_address, SUM(Amount) AS amount FROM delegations WHERE validator_address=? GROUP BY delegator_address ORDER BY SUM(Amount) DESC LIMIT ${limit} OFFSET ${offset}`;
        const sqlCount = `SELECT COUNT(*) AS total FROM (SELECT COUNT(*) AS total FROM delegations WHERE validator_address=? GROUP BY delegator_address) tbCount`;
        const pageResults = await this.query(sqlSelect, [validatorAddress]);
        const count = await this.query(sqlCount, [validatorAddress]);
        return {pageResults, count};
    }
}
