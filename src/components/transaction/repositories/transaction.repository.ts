import { EntityRepository, Raw, Repository } from 'typeorm';

import { Transaction } from '../../../shared';

@EntityRepository(Transaction)
export class TransactionRepository extends Repository<Transaction> {

    async getTransactionsByAddress(address: string, limit: number, offset: number) {

        const [transactions, count]  = await this.findAndCount({
            where: (
              { raw_log: Raw(() => `code = 0 AND
                (JSON_CONTAINS(JSON_EXTRACT( (CASE WHEN LENGTH(raw_log) = 0 THEN "[]" else raw_log END), "$[*].events[*].type"), '"delegate"', '$') = 1
                OR JSON_CONTAINS(JSON_EXTRACT( (CASE WHEN LENGTH(raw_log) = 0 THEN "[]" else raw_log END), "$[*].events[*].type"), '"unbond"', '$') = 1)
                AND JSON_CONTAINS(JSON_EXTRACT( (CASE WHEN LENGTH(raw_log) = 0 THEN "[]" else raw_log END), "$[*].events[*].attributes[*].key"), '"validator"', '$') = 1
                AND JSON_CONTAINS(JSON_EXTRACT( (CASE WHEN LENGTH(raw_log) = 0 THEN "[]" else raw_log END), "$[*].events[*].attributes[*].value"), '"${address}"', '$') = 1
                `)}
            ),
            order: { height: 'DESC' },
            take: limit,
            skip: offset,
          });

        return {transactions, total: count};
   }

   async getTransactionsByDelegatorAddress(address: string, limit: number, offset: number) {
         
        const [transactions, count]  = await this.findAndCount({
            where: (
            { messages: Raw(() => `JSON_SEARCH(messages, 'all', '${address}')`)}
            ),
            order: { height: 'DESC' },
            take: limit,
            skip: offset,
        });

       return {transactions, total: count};
  }
}
