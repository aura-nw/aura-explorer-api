import { InjectRepository } from "@nestjs/typeorm";
import { CONTRACT_TRANSACTION_EXECUTE_TYPE, CONTRACT_TRANSACTION_TYPE, TokenContract } from "../../../shared";
import { EntityRepository, ObjectLiteral, Repository } from "typeorm";
import { TokenTransactionParamsDto } from "../../../components/cw20-token/dtos/token-transaction-params.dto";

@EntityRepository(TokenContract)
export class TokenContractRepository extends Repository<TokenContract> {
    constructor(@InjectRepository(TokenContract) private readonly repos: Repository<ObjectLiteral>) {
        super();
    }

    async getListTokenTransactions(request: TokenTransactionParamsDto) {
        let result = [];
        let params = [];
        let sqlSelect: string = `SELECT *`;
        let sqlCount: string = `SELECT COUNT(id) AS total`;
        let sql: string = ` FROM transactions
            WHERE contract_address = ? AND type = '${CONTRACT_TRANSACTION_TYPE.EXECUTE}'`;
        params.push(request.contract_address);
        if (request?.tx_hash) {
            sql += ` AND tx_hash = ?`;
            params.push(request.tx_hash);
        }
        if (request?.account_address) {
            sql += ` AND ((REPLACE(SUBSTRING_INDEX(REPLACE(JSON_EXTRACT(messages, '$[0].msg'), '{', ''), ': ', 1), '"', '') = '${CONTRACT_TRANSACTION_EXECUTE_TYPE.MINT}' 
                    AND (JSON_EXTRACT(messages, CONCAT('$[0].msg.', REPLACE(SUBSTRING_INDEX(REPLACE(JSON_EXTRACT(messages, '$[0].msg'), '{', ''), ': ', 1), '"', ''), '.recipient')) = ?
                        OR JSON_EXTRACT(messages, CONCAT('$[0].msg.', REPLACE(SUBSTRING_INDEX(REPLACE(JSON_EXTRACT(messages, '$[0].msg'), '{', ''), ': ', 1), '"', ''), '.owner')) = ?)) 
                OR (REPLACE(SUBSTRING_INDEX(REPLACE(JSON_EXTRACT(messages, '$[0].msg'), '{', ''), ': ', 1), '"', '') = '${CONTRACT_TRANSACTION_EXECUTE_TYPE.BURN}'
                    AND JSON_EXTRACT(messages, '$[0].sender') = ?) 
                OR (REPLACE(SUBSTRING_INDEX(REPLACE(JSON_EXTRACT(messages, '$[0].msg'), '{', ''), ': ', 1), '"', '') NOT IN ('${CONTRACT_TRANSACTION_EXECUTE_TYPE.MINT}', '${CONTRACT_TRANSACTION_EXECUTE_TYPE.BURN}') 
                    OR JSON_EXTRACT(messages, CONCAT('$[0].msg.', REPLACE(SUBSTRING_INDEX(REPLACE(JSON_EXTRACT(messages, '$[0].msg'), '{', ''), ': ', 1), '"', ''), '.recipient')) = ?
                    OR JSON_EXTRACT(messages, CONCAT('$[0].msg.', REPLACE(SUBSTRING_INDEX(REPLACE(JSON_EXTRACT(messages, '$[0].msg'), '{', ''), ': ', 1), '"', ''), '.owner')) = ?
                    OR SUBSTRING_INDEX(REPLACE(JSON_EXTRACT(messages, '$[0].msg'), '{', ''), ': ', 1) = 'burn' AND JSON_EXTRACT(messages, '$[0].sender') = ?))`;
            params.push(request.account_address);
            params.push(request.account_address);
            params.push(request.account_address);
            params.push(request.account_address);
            params.push(request.account_address);
            params.push(request.account_address);
        }
        if (request?.token_id) {
            sql += ` AND JSON_EXTRACT(messages, CONCAT('$[0].msg.', REPLACE(SUBSTRING_INDEX(REPLACE(JSON_EXTRACT(messages, '$[0].msg'), '{', ''), ': ', 1), '"', ''), '.token_id')) = ?`;
            params.push(request.token_id);
        }
        sql += " ORDER BY updated_at DESC";
        let sqlLimit = " LIMIT ? OFFSET ?";
        params.push(request.limit);
        params.push(request.offset);
    
        result[0] = await this.query(sqlSelect + sql + sqlLimit, params);
        result[1] = await this.query(sqlCount + sql, params);
        return result;
    }
}