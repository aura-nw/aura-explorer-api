import { Nft } from "../../../shared/entities/nft.entity";
import { EntityRepository, ObjectLiteral, Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { NftParamsDto } from "../dtos/nft-params.dto";
import { CONTRACT_TRANSACTION_EXECUTE_TYPE, CONTRACT_TRANSACTION_TYPE, Transaction } from "../../../shared";
import { TokenTransaction } from "../../../shared/entities/token-transaction.entity";

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

    async getNftsByContractAddress(contractAddress: string, request: NftParamsDto): Promise<[any, number]> {
        let params = { contractAddress: contractAddress };
        let conditions = `trans.contract_address =:contractAddress
                            AND length(nf.owner) > 0 AND tokenTrans.id > IFNULL((
                                    select max(id) last_id from token_transactions 
                                        WHERE contract_address =:contractAddress
                                        AND token_id = tokenTrans.token_id
                                        AND transaction_type = '${CONTRACT_TRANSACTION_EXECUTE_TYPE.BURN}' GROUP BY contract_address, token_id),0)
                                        {groupBy} {limit}`;


        let selQuery = this.createQueryBuilder('nf');
        selQuery.select(`nf.contract_address, nf.token_id, nf.owner, nf.uri, nf.uri_s3, max(trans.timestamp) lastTime`)
            .innerJoin(Transaction, 'trans', 'trans.contract_address = nf.contract_address')
            .innerJoin(TokenTransaction, 'tokenTrans', 'tokenTrans.tx_hash = trans.tx_hash and tokenTrans.token_id = nf.token_id');

        const selCount = this.createQueryBuilder('nf').select(`COUNT(DISTINCT nf.id) AS total`)
            .innerJoin(Transaction, 'trans', 'trans.contract_address = nf.contract_address')
            .innerJoin(TokenTransaction, 'tokenTrans', 'tokenTrans.tx_hash = trans.tx_hash and tokenTrans.token_id = nf.token_id');

        if (request?.token_id) {
            conditions = ` nf.token_id =:tokenId AND ` + conditions;
            params['tokenId'] = request?.token_id;
        }
        if (request?.owner) {
            conditions = ` nf.owner =:owner AND ` + conditions;
            params['owner'] = request?.owner;
        }

        let data = [];
        if (request.limit > 0) {
            data = await selQuery
                .where(
                    conditions.replace('{groupBy}', 'GROUP BY nf.contract_address, nf.token_id, nf.owner, nf.uri, nf.uri_s3')
                        .replace('{limit}', ` LIMIT ${request.limit} OFFSET ${request.offset}`)
                )
                .setParameters(params)
                .getRawMany();

        } else {
            data = await selQuery
                .where(conditions.replace('{groupBy}', '').replace('{limit}', ''))
                .setParameters(params)
                .groupBy('nf.contract_address, nf.token_id, nf.owner, nf.uri, nf.uri_s3')
                .getRawMany();
        }

        const count = await selCount
            .where(conditions.replace('{groupBy}', '').replace('{limit}', ''))
            .setParameters(params)
            .getRawOne();


        return [data, Number(count?.total) || 0];
    }
}