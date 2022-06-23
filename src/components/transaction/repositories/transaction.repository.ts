import { SearchTransactionParamsDto } from '../../../components/contract/dtos/search-transaction-params.dto';
import { EntityRepository, Raw, Repository } from 'typeorm';

import { CONST_CHAR, CONST_FULL_MSG_TYPE, CONST_MSG_TYPE, CONTRACT_TRANSACTION_LABEL, CONTRACT_TRANSACTION_TYPE, Transaction } from '../../../shared';

@EntityRepository(Transaction)
export class TransactionRepository extends Repository<Transaction> {

  async getTransactionsByAddress(address: string, limit: number, offset: number) {

    const [transactions, count] = await this.findAndCount({
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
}
