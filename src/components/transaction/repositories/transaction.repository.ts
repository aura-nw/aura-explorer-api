import { EntityRepository, Raw, Repository } from 'typeorm';

import { CONST_FULL_MSG_TYPE, CONTRACT_TRANSACTION_LABEL, CONTRACT_TRANSACTION_TYPE, Transaction } from '../../../shared';
@EntityRepository(Transaction)
export class TransactionRepository extends Repository<Transaction> {

  async getTransactionsByAddress(address: string, limit: number, offset: number) {

    const [transactions, count] = await this.findAndCount({
      where: (
        {
          messages: Raw(() => `type IN ('${CONST_FULL_MSG_TYPE.MSG_DELEGATE}', '${CONST_FULL_MSG_TYPE.MSG_REDELEGATE}', '${CONST_FULL_MSG_TYPE.MSG_UNDELEGATE}', '${CONST_FULL_MSG_TYPE.MSG_CREATE_VALIDATOR}') 
                            AND code = 0 AND messages LIKE '%${address}%'`),
        }
      ),
      order: { height: 'DESC' },
      take: limit,
      skip: offset,
    });

    return { transactions, total: count };
  }
}
