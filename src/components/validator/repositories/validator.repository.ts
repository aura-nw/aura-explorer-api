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
    async getDelegators(operatorAddress: string, delegatorAddress: string) {
        const sql = `SELECT val.title, val.operator_address, val.acc_address, val.commission, val.status, val.jailed,
                    (SELECT del.delegator_address FROM delegations del WHERE del.delegator_address=? AND del.validator_address = val.operator_address) AS staking_address
            FROM validators val WHERE val.OPERATOR_ADDRESS!=? AND val.status=3`;
        return await this.query(sql, [delegatorAddress, operatorAddress]);
    }
}
