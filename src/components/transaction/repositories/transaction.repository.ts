import { EntityRepository, Raw, Repository } from 'typeorm';

import { CONST_CHAR, CONST_FULL_MSG_TYPE, CONST_MSG_TYPE, Transaction } from '../../../shared';

@EntityRepository(Transaction)
export class TransactionRepository extends Repository<Transaction> {

    async getTransactionsByAddress(address: string, limit: number, offset: number) {

        const [transactions, count]  = await this.findAndCount({
            where: (
              {
                messages: Raw(() => `code = 0 AND messages LIKE '%${address}%'
                  AND (type = '${CONST_FULL_MSG_TYPE.MSG_DELEGATE}' OR type = '${CONST_FULL_MSG_TYPE.MSG_REDELEGATE}' OR type = '${CONST_FULL_MSG_TYPE.MSG_UNDELEGATE}')`),
              }
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
