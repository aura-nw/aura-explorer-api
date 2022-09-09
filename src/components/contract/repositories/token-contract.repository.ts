import { InjectRepository } from "@nestjs/typeorm";
import { Cw721TokenParamsDto } from "../../../components/cw721-token/dtos/cw721-token-params.dto";
import { EntityRepository, FindManyOptions, Not, ObjectLiteral, Raw, Repository } from "typeorm";
import { Cw20TokenByOwnerParamsDto } from "../../../components/cw20-token/dtos/cw20-token-by-owner-params.dto";
import { NftByOwnerParamsDto } from "../../../components/cw721-token/dtos/nft-by-owner-params.dto";
import { AURA_INFO, CONTRACT_CODE_RESULT, CONTRACT_TRANSACTION_EXECUTE_TYPE, CONTRACT_TRANSACTION_TYPE, CONTRACT_TYPE, TokenContract } from "../../../shared";

@EntityRepository(TokenContract)
export class TokenContractRepository extends Repository<TokenContract> {
    constructor(@InjectRepository(TokenContract) private readonly repos: Repository<ObjectLiteral>) {
        super();
    }

    async getDataTokens(type: CONTRACT_TYPE, keyword: string, limit: number, offset: number) {
        let condition: FindManyOptions<TokenContract> = {
            where: {
                type: type,
                contract_address: Not(AURA_INFO.CONNTRACT_ADDRESS)
            },
            order: { circulating_market_cap: 'DESC', updated_at: 'DESC' },
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
        return [tokens, count];
    }
    
    async getCw20TokensByOwner(request: Cw20TokenByOwnerParamsDto) {
        let result = [];
        let params = [];
        let sqlSelect: string = `SELECT tc.name, tc.symbol, tc.image, tc.contract_address, cto.balance, tc.decimals, tc.max_total_supply,
            tc.price, tc.price_change_percentage_24h, (price * cto.balance) AS value`;
        let sqlCount: string = `SELECT COUNT(tc.id) AS total`;
        let sql: string = ` FROM token_contracts tc
                LEFT JOIN cw20_token_owners cto ON tc.contract_address = cto.contract_address
            WHERE ((cto.owner = ? AND cto.balance > 0) 
                OR tc.contract_address = '${AURA_INFO.CONNTRACT_ADDRESS}')`;
        params.push(request.account_address);
        if(request?.keyword) {
            sql += ` AND (LOWER(tc.name) LIKE ? OR LOWER(tc.contract_address) LIKE ?)`
            params.push(`%${request.keyword.toLowerCase()}%`);
            params.push(`%${request.keyword.toLowerCase()}%`);
        }
        sql += ` ORDER BY FIELD(tc.contract_address, '${AURA_INFO.CONNTRACT_ADDRESS}') DESC, (price * cto.balance) DESC, tc.updated_at DESC`;
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

    async getCw721Tokens(request: Cw721TokenParamsDto) {
        let result = [];
        let params = [];
        let sqlSelect: string = `SELECT sc.token_name AS name, sc.token_symbol AS symbol, sc.contract_address, sc.num_tokens,
            (SELECT COUNT(id)
                FROM transactions
                WHERE contract_address = sc.contract_address
                    AND timestamp > NOW() - INTERVAL 24 HOUR) AS transfers_24h,
            (SELECT COUNT(id)
                FROM transactions
                WHERE contract_address = sc.contract_address
                    AND timestamp > NOW() - INTERVAL 72 HOUR) AS transfers_3d,
            (SELECT timestamp
                FROM transactions
                WHERE contract_address = sc.contract_address
                ORDER BY timestamp DESC
                LIMIT 1) AS upTime`;
        let sqlCount: string = `SELECT COUNT(sc.id) AS total`;
        let sql: string = ` FROM smart_contracts sc
                INNER JOIN smart_contract_codes scc ON sc.code_id = scc.code_id AND scc.result = '${CONTRACT_CODE_RESULT.CORRECT}' AND scc.type = '${CONTRACT_TYPE.CW721}'
            WHERE sc.is_minted = true`;
        if(request?.keyword) {
            sql += ` AND (LOWER(sc.token_name) LIKE ? OR LOWER(sc.contract_address) LIKE ?)`
            params.push(`%${request.keyword.toLowerCase()}%`);
            params.push(`%${request.keyword.toLowerCase()}%`);
        }
        let sqlOrder = '';
        if (request?.sort_column && request?.sort_order) {
            sqlOrder = ` ORDER BY ${request.sort_column} ${request.sort_order}, upTime DESC`;
        } else {
            sqlOrder = ` ORDER BY transfers_24h DESC, upTime DESC`;
        }
        let sqlLimit = '';
        if(request.limit > 0) {
            sqlLimit = ' LIMIT ? OFFSET ?';
            params.push(request.limit);
            params.push(request.offset);
        }
    
        result[0] = await this.query(sqlSelect + sql + sqlOrder + sqlLimit, params);
        result[1] = await this.query(sqlCount + sql, params);

        return result;
    }
    
    async getTokensByListContractAddress(listContractAddress: Array<any>) {
        let sql = `SELECT contract_address, contract_name, token_symbol AS symbol
            FROM smart_contracts
            WHERE contract_address IN (?)`;

        return await this.repos.query(sql, [listContractAddress]);
    }

    async getTokenByContractAddress(contractAddress: string) {
        let sql = `SELECT sc.token_name AS name, sc.token_symbol AS symbol, sc.num_tokens,
                sc.contract_address, sc.contract_verification, sc.tx_hash, scc.type
            FROM smart_contracts sc
                INNER JOIN smart_contract_codes scc ON sc.code_id = scc.code_id
            WHERE sc.contract_address = ?`;

        return await this.repos.query(sql, [contractAddress]);
    }

    async getTotalAssetByAccountAddress(accountAddress: string) {
        const sql = `SELECT SUM(tc.price * cto.balance) AS total
            FROM token_contracts tc
            LEFT JOIN cw20_token_owners cto ON tc.contract_address = cto.contract_address
        WHERE cto.owner = ?`;

        return await this.repos.query(sql, [accountAddress]);
    }
}