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
     * @param delegatorAddr 
    */
    async getDelegators(delegatorAddress: string) {
        const sql = 'SELECT val.title, val.operator_address, val.acc_address, val.commission FROM validators val WHERE val.OPERATOR_ADDRESS !=(SELECT del.validator_address FROM delegations del WHERE del.delegator_address=?) ';
        return  await this.query(sql, [delegatorAddress]);
    }
}
