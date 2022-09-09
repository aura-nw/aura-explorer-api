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
        let sql = `SELECT n.*, tc.name, sc.creator_address AS creator, tc.symbol, n.is_burn AS is_burned
            FROM nfts n
                INNER JOIN token_contracts tc ON n.contract_address = tc.contract_address
                LEFT JOIN smart_contracts sc on n.contract_address = sc.contract_address
            WHERE n.contract_address = ? AND n.token_id = ?`;

        return await this.repos.query(sql, [contractAddress, tokenId]);
    }

    async getNftsByContractAddress(contractAddress: string, request: NftParamsDto): Promise<[any, number]> {
        const params = { contractAddress };
        let conditions = ` nf.contract_address=:contractAddress AND length(nf.owner) > 0 `;

        let selQuery = this.createQueryBuilder('nf')
            .select('nf.contract_address, nf.token_id, nf.owner, nf.uri, nf.uri_s3')
            .innerJoin(TokenTransaction, 'tokenTrans', 'tokenTrans.token_id = nf.token_id AND nf.contract_address = tokenTrans.contract_address AND tokenTrans.height >0')
            .limit(request.limit)
            .offset(request.offset)
            .groupBy('nf.contract_address, nf.token_id, nf.owner, nf.uri, nf.uri_s3')
            .orderBy('MAX(tokenTrans.height)', 'DESC');

        const countQuery = this.createQueryBuilder('nf')
            .select('COUNT(DISTINCT nf.id) AS total')
            .innerJoin(TokenTransaction, 'tokenTrans', 'tokenTrans.token_id = nf.token_id AND nf.contract_address = tokenTrans.contract_address')

        if (request?.token_id) {
            conditions += ` AND nf.token_id =:tokenId`;
            params['tokenId'] = request?.token_id;
        }
        if (request?.owner) {
            conditions += ` nf.owner =:owner`;
            params['owner'] = request?.owner;
        }

        conditions += ` AND tokenTrans.height > IFNULL((select max(height) last_id from token_transactions 
                                            WHERE contract_address =:contractAddress
                                            AND token_id = tokenTrans.token_id
                                            AND transaction_type = '${CONTRACT_TRANSACTION_EXECUTE_TYPE.BURN}'), 0)`;

        selQuery = selQuery.where(conditions).setParameters(params);

        const data = await selQuery.where(conditions).setParameters(params).getRawMany();
        const count = await countQuery.where(conditions).setParameters(params).getRawOne();
        return [data, Number(count?.total) || 0];
    }
}