import { Nft } from "../../../shared/entities/nft.entity";
import { EntityRepository, ObjectLiteral, Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { NftParamsDto } from "../dtos/nft-params.dto";
import { CONTRACT_TRANSACTION_TYPE } from "../../../shared";

@EntityRepository(Nft)
export class NftRepository extends Repository<Nft> {
    constructor(@InjectRepository(Nft) private readonly repos: Repository<ObjectLiteral>) {
        super();
    }

    async getNftByContractAddressAndTokenId(contractAddress: string, tokenId: string) {
        let sql = `SELECT n.*, tc.name, sc.creator_address AS creator, tc.symbol
            FROM nfts n
                INNER JOIN token_contracts tc ON n.contract_address = tc.contract_address
                LEFT JOIN smart_contracts sc on n.contract_address = sc.contract_address
            WHERE n.contract_address = ? AND n.token_id = ? AND n.is_burn = 0`;

        return await this.repos.query(sql, [contractAddress, tokenId]);
    }

    async getNftsByContractAddress(contractAddress: string, request: NftParamsDto) {
        let result = [];
        let params = [];
        let sqlSelect: string = `SELECT n.*`;
        let sqlCount: string = `SELECT COUNT(n.id) AS total`;
        let sql: string = ` FROM nfts n
                INNER JOIN (
                    SELECT tx_hash, contract_address, MAX(timestamp) AS timestamp,
                        REPLACE(SUBSTRING_INDEX(REPLACE(JSON_EXTRACT(messages, '$[0].msg'), '{', ''), ': ', 1), '"', ''),
                        REPLACE(JSON_EXTRACT(messages, CONCAT('$[0].msg.', REPLACE(SUBSTRING_INDEX(REPLACE(JSON_EXTRACT(messages, '$[0].msg'), '{', ''), ': ', 1), '"', ''), '.token_id')), '"', '') AS token_id
                    FROM transactions
                    WHERE contract_address != ''
                        AND type = '${CONTRACT_TRANSACTION_TYPE.EXECUTE}'
                    GROUP BY token_id
                    ORDER BY timestamp DESC
                ) tx ON n.contract_address = tx.contract_address AND n.token_id = tx.token_id
            WHERE n.contract_address = ? AND is_burn = 0`;
        params.push(contractAddress);
        if(request?.token_id) {
            sql += ` AND n.token_id = ?`
            params.push(request.token_id);
        }
        if(request?.owner) {
            sql += ` AND n.owner = ?`
            params.push(request.owner);
        }
        sql += " ORDER BY tx.timestamp DESC";
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
}