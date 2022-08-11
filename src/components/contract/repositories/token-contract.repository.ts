import { InjectRepository } from "@nestjs/typeorm";
import { EntityRepository, FindManyOptions, ObjectLiteral, Raw, Repository } from "typeorm";
import { TokenTransactionParamsDto } from "../../../components/cw20-token/dtos/token-transaction-params.dto";
import { CONTRACT_TRANSACTION_EXECUTE_TYPE, CONTRACT_TRANSACTION_TYPE, CONTRACT_TYPE, TokenContract } from "../../../shared";

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

    async getDataTokens(type: CONTRACT_TYPE, keyword: string, limit: number, offset: number) {
        let condition: FindManyOptions<TokenContract> = {
            where: {
                type: CONTRACT_TYPE.CW20,
            },
            order: { updated_at: 'DESC' },
        }

        if (keyword) {
            condition.where = [
                {
                    type: type,
                    ...(keyword && { contract_address: Raw(() => ` LOWER(contract_address) LIKE :keyword`, { keyword: `%${keyword}%`.toLowerCase() }) }),
                },
                {
                    type: type,
                    ...(keyword && { contract_address: Raw(() => ` LOWER(name) LIKE :keyword`, { keyword: `%${keyword}%`.toLowerCase() }) })
                }
            ]
        }
        if (limit > 0) {
            condition['take'] = limit;
            condition['skip'] = offset;
        }
        const [tokens, count] = await this.findAndCount(condition);
        return { tokens: tokens, count: count };
    }
}