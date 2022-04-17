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
        const sql = 'SELECT val.title, val.operator_address, val.acc_address, val.commission FROM VALIDATORS val WHERE val.OPERATOR_ADDRESS !=(SELECT VALIDATOR_ADDRESS FROM DELEGATIONS del WHERE del.DELEGATOR_ADDRESS=?) ';
        return  await this.query(sql, [delegatorAddress]);
    }
}
