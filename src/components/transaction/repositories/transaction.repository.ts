import { SearchTransactionParamsDto } from '../../../components/contract/dtos/search-transaction-params.dto';
import { EntityRepository, ObjectLiteral, Raw, Repository } from 'typeorm';

import { CONST_CHAR, CONST_FULL_MSG_TYPE, CONST_MSG_TYPE, CONTRACT_TRANSACTION_LABEL, CONTRACT_TRANSACTION_TYPE, CONTRACT_TYPE, TokenContract, Transaction } from '../../../shared';
import { TokenTransaction } from '../../../shared/entities/token-transaction.entity';
import { CONTRACT_TRANSACTION_EXECUTE_TYPE } from "../../../shared";
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

  async getTransactionsByDelegatorAddress(address: string, limit: number, offset: number) {

    const [transactions, count] = await this.findAndCount({
      where: (
        { messages: Raw(() => `JSON_SEARCH(messages, 'all', '${address}')`) }
      ),
      order: { height: 'DESC' },
      take: limit,
      skip: offset,
    });

    return { transactions, total: count };
  }

  async searchContractTransactions(request: SearchTransactionParamsDto) {
    let result = [];
    let params = [];
    let sqlSelect: string = `SELECT *`;
    let sqlCount: string = `SELECT COUNT(Id) AS total`;
    let sql: string = ` FROM transactions`;
    if (request?.label) {
      if (request.label === CONTRACT_TRANSACTION_LABEL.IN) {
        sql += ` WHERE ( contract_address = ?
            AND type = '${CONTRACT_TRANSACTION_TYPE.EXECUTE}'
          ) OR (
            type = '${CONTRACT_TRANSACTION_TYPE.SEND}'
            AND REPLACE(JSON_EXTRACT(messages, '$[0].to_address'), '\"', '') = ?
            )`;
        params.push(request.contract_address);
        params.push(request.contract_address);
      } else if (request.label === CONTRACT_TRANSACTION_LABEL.OUT) {
        sql += ` WHERE ( type = '${CONTRACT_TRANSACTION_TYPE.SEND}'
            AND REPLACE(JSON_EXTRACT(messages, '$[0].from_address'), '\"', '') = ?
          ) OR (
            type = '${CONTRACT_TRANSACTION_TYPE.EXECUTE}'
                AND REPLACE(JSON_EXTRACT(messages, '$[0].sender'), '\"', '') = ?
            )`;
        params.push(request.contract_address);
        params.push(request.contract_address);
      } else if (request.label === CONTRACT_TRANSACTION_LABEL.CREATION) {
        sql += ` WHERE contract_address = ?
          AND type = '${CONTRACT_TRANSACTION_TYPE.INSTANTIATE}'`;
        params.push(request.contract_address);
      }
    } else {
      sql += ` WHERE ( ( ( contract_address = ?
            AND type = '${CONTRACT_TRANSACTION_TYPE.EXECUTE}'
          ) OR (
            type = '${CONTRACT_TRANSACTION_TYPE.SEND}'
            AND REPLACE(JSON_EXTRACT(messages, '$[0].to_address'), '\"', '') = ?
            ) )
        OR ( ( type = '${CONTRACT_TRANSACTION_TYPE.SEND}'
            AND REPLACE(JSON_EXTRACT(messages, '$[0].from_address'), '\"', '') = ?
          ) OR (
            type = '${CONTRACT_TRANSACTION_TYPE.EXECUTE}'
                AND REPLACE(JSON_EXTRACT(messages, '$[0].sender'), '\"', '') = ?
            ) )
        OR ( contract_address = ?
            AND type = '${CONTRACT_TRANSACTION_TYPE.INSTANTIATE}' ) )`;
      params.push(request.contract_address);
      params.push(request.contract_address);
      params.push(request.contract_address);
      params.push(request.contract_address);
      params.push(request.contract_address);
    }
    sql += " ORDER BY height DESC";
    let sqlLimit = " LIMIT ? OFFSET ?";
    params.push(request.limit);
    params.push(request.offset);

    result[0] = await this.query(sqlSelect + sql + sqlLimit, params);
    result[1] = await this.query(sqlCount + sql, params);
    return result;
  }

  /**
   * Get transaction by contract address and type
   * @param address 
   * @param type 
   * @param limit 
   * @param offset 
   * @returns 
   */
  async getTransactionContract(contract_address: string, account_address: string, tx_hash: string, token_id: string, limit: number, offset: number) {
    let conditions = ` tokenContract.type=:contract_type`;
    const paras = { 'contract_type': CONTRACT_TYPE.CW721 };
    const selQuery = this.createQueryBuilder('trans')
      .select(`trans.*, tokenTrans.id AS tokenTrans_id, tokenTrans.token_id`)
      .innerJoin(TokenContract, 'tokenContract', 'tokenContract.contract_address = trans.contract_address')
      .innerJoin(TokenTransaction, 'tokenTrans', 'tokenTrans.tx_hash = trans.tx_hash');

    const selCount = this.createQueryBuilder('trans')
      .select(`COUNT(trans.id) AS total`)
      .innerJoin(TokenContract, 'tokenContract', 'tokenContract.contract_address = trans.contract_address')
      .innerJoin(TokenTransaction, 'tokenTrans', 'tokenTrans.tx_hash = trans.tx_hash');

    if (contract_address) {
      conditions += ' AND trans.contract_address=:contract_address ';
      paras['contract_address'] = contract_address;
    }

    /**
     * @todo implement after refactoer db
     */
    if (account_address) {

    }

    if (tx_hash) {
      conditions += ' AND trans.tx_hash=:tx_hash ';
      paras['tx_hash'] = tx_hash;
    }

    if (token_id) {
      conditions += ' AND tokenTrans.token_id=:token_id ';
      paras['token_id'] = token_id;
    }

    const transactions = await selQuery
      .where(conditions)
      .setParameters(paras)
      .limit(limit)
      .offset(limit * offset)
      .orderBy('trans.timestamp', "ASC")
      .getRawMany();

    const count = await selCount
      .where(conditions)
      .setParameters(paras)
      .getRawOne();
    return [transactions, count];
  }

  /**
   * Get transactions by Address and Token Id
   * @param address 
   * @param tokenType 
   * @param token_id 
   * @param limit 
   * @param offset 
   * @returns 
   */
  async viewNTFTransaction(address: string, tokenType: string, token_id, limit: number, offset: number) {
    const conditions = `tokenContract.type =:tokenType
                        AND trans.contract_address =:address
                        AND tokenTrans.id > IFNULL((SELECT MAX(sToken.id) FROM token_transactions sToken 
                          WHERE sToken.token_id =:token_id AND contract_address =:address
                            AND sToken.transaction_type = '${CONTRACT_TRANSACTION_EXECUTE_TYPE.BURN}'), 0)
                            AND tokenTrans.token_id =:token_id`;

    const paras = { tokenType, token_id, address };
    const transactions = this.createQueryBuilder('trans')
      .select(`trans.*, tokenTrans.id AS tokenTrans_id, tokenTrans.token_id`)
      .innerJoin(TokenContract, 'tokenContract', 'tokenContract.contract_address = trans.contract_address')
      .innerJoin(TokenTransaction, 'tokenTrans', 'tokenTrans.tx_hash = trans.tx_hash')
      .where(conditions)
      .setParameters(paras)
      .take(limit)
      .skip(limit * offset)
      .orderBy('trans.timestamp', 'DESC')
      .getRawMany();

    const count = await this.createQueryBuilder('trans')
      .select(`COUNT(trans.id) AS total`)
      .innerJoin(TokenContract, 'tokenContract', 'tokenContract.contract_address = trans.contract_address')
      .innerJoin(TokenTransaction, 'tokenTrans', 'tokenTrans.tx_hash = trans.tx_hash')
      .where(conditions)
      .setParameters(paras)
      .getRawOne();

    return [transactions, count];
  }
}
