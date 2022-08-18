import { InjectRepository } from "@nestjs/typeorm";
import { EntityRepository, FindManyOptions, ObjectLiteral, Raw, Repository } from "typeorm";
import { Cw20TokenByOwnerParamsDto } from "../../../components/cw20-token/dtos/cw20-token-by-owner-params.dto";
import { TokenTransactionParamsDto } from "../../../components/cw20-token/dtos/token-transaction-params.dto";
import { NftByOwnerParamsDto } from "../../../components/cw721-token/dtos/nft-by-owner-params.dto";
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
                    AND (JSON_EXTRACT(messages, CONCAT('$[0].msg.', REPLACE(SUBSTRING_INDEX(REPLACE(JSON_EXTRACT(messages, '$[0].msg'), '{', ''), ': ', 1), '"', ''), '.recipient')) = ?
                    OR JSON_EXTRACT(messages, CONCAT('$[0].msg.', REPLACE(SUBSTRING_INDEX(REPLACE(JSON_EXTRACT(messages, '$[0].msg'), '{', ''), ': ', 1), '"', ''), '.owner')) = ?
                    OR JSON_EXTRACT(messages, '$[0].sender') = ?)))`;
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
                type: type,
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
    
    async getCw20TokensByOwner(request: Cw20TokenByOwnerParamsDto) {
        let result = [];
        let params = [];
        let sqlSelect: string = `SELECT tc.name, tc.symbol, tc.image, tc.contract_address, cto.balance, tc.decimals, tc.total_supply`;
        let sqlCount: string = `SELECT COUNT(tc.id) AS total`;
        let sql: string = ` FROM token_contracts tc
                INNER JOIN cw20_token_owners cto ON tc.contract_address = cto.contract_address
            WHERE cto.owner = ?
                AND cto.balance > 0`;
        params.push(request.account_address);
        if(request?.keyword) {
            sql += ` AND (LOWER(tc.name) LIKE ? OR LOWER(tc.contract_address) LIKE ?)`
            params.push(`%${request.keyword.toLowerCase()}%`);
            params.push(`%${request.keyword.toLowerCase()}%`);
        }
        sql += " ORDER BY tc.updated_at DESC";
        let sqlLimit = "";
        if(request.limit > 0) {
            sqlLimit = " LIMIT ? OFFSET ?";
            params.push(request.limit);
            params.push(request.offset);
        }
    
        result[0] = await this.query(sqlSelect + sql + sqlLimit, params);
        result[1] = await this.query(sqlCount + sql, params);
        return result;
    }

    async getNftsByOwner(request: NftByOwnerParamsDto) {
        let result = [];
        let params = [];
        let sqlSelect: string = `SELECT tc.contract_address, sc.contract_name, n.token_id, n.uri`;
        let sqlCount: string = `SELECT COUNT(tc.id) AS total`;
        let sql: string = ` FROM token_contracts tc
                    INNER JOIN smart_contracts sc ON tc.contract_address = sc.contract_address
                    INNER JOIN nfts n ON tc.contract_address = n.contract_address AND n.is_burn = 0
                WHERE n.owner = ?`;
        params.push(request.account_address);
        if(request?.keyword) {
            sql += `  AND (LOWER(n.token_id) LIKE ? OR LOWER(tc.contract_address) LIKE ?)`
            params.push(`%${request.keyword.toLowerCase()}%`);
            params.push(`%${request.keyword.toLowerCase()}%`);
        }
        sql += " ORDER BY tc.updated_at DESC";
        let sqlLimit = "";
        if(request.limit > 0) {
            sqlLimit = " LIMIT ? OFFSET ?";
            params.push(request.limit);
            params.push(request.offset);
        }
    
        result[0] = await this.query(sqlSelect + sql + sqlLimit, params);
        result[1] = await this.query(sqlCount + sql, params);
        return result;
    }

    async getTokenByContractAddress(contractAddress: string) {
        let sql = `SELECT tc.*, sc.contract_verification
            FROM token_contracts tc
                INNER JOIN smart_contracts sc ON tc.contract_address = sc.contract_address
            WHERE tc.contract_address = ?`;

        return await this.repos.query(sql, [contractAddress]);
    }
}