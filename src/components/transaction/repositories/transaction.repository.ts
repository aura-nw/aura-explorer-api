import { EntityRepository, Repository } from 'typeorm';

import { Transaction } from '../../../shared';
@EntityRepository(Transaction)
export class TransactionRepository extends Repository<Transaction> {

}
