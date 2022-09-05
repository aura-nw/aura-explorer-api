import { InjectRepository } from "@nestjs/typeorm";
import { EntityRepository, Repository } from "typeorm";
import { CONTRACT_TRANSACTION_EXECUTE_TYPE } from "../../../shared";
import { TokenTransaction } from "../../../shared/entities/token-transaction.entity";

@EntityRepository(TokenTransaction)
export class TokenTransactionRepository extends Repository<TokenTransaction>{
    constructor(@InjectRepository(TokenTransaction) private readonly repos: Repository<TokenTransaction>) {
        super();
    }

    async getBurnByAddress(address: string){
     return await this.createQueryBuilder()
        .select(`contract_address, token_id, max(id) last_id`)
        .where({
            contract_address: address,
            transaction_type: CONTRACT_TRANSACTION_EXECUTE_TYPE.BURN
        })
        .groupBy('contract_address, token_id')
        .execute();
    }
}