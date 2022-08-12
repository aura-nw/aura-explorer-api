import { Nft } from "../../../shared/entities/nft.entity";
import { EntityRepository, ObjectLiteral, Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";

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
            WHERE n.contract_address = ? AND n.token_id = ?`;

        return await this.repos.query(sql, [contractAddress, tokenId]);
    }
}