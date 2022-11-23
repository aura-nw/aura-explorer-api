import { Logger } from "@nestjs/common";
import { EntityRepository, In, Repository } from "typeorm";
import { SoulboundToken } from "../../../shared";
import { SmartContract } from "../../../shared/entities/smart-contract.entity";



@EntityRepository(SoulboundToken)
export class SoulboundTokenRepository extends Repository<SoulboundToken>{
    private readonly _logger = new Logger(SoulboundTokenRepository.name);

    /**
     * Get list tokens by minter address and contract address
     * @param minterAddress 
     * @param contractAddress 
     * @param limit 
     * @param offset 
     * @returns 
     */
    async getTokens(minterAddress: string, contractAddress: string, limit: number, offset: number) {
        const builder = this.createQueryBuilder('sbt')
            .select('sbt.*')
            .innerJoin(SmartContract, 'sm', 'sm.id = sbt.smart_contract_id')
            .where(
                `sm.minter_address=:minterAddress AND sm.contract_address=:contractAddress`,
                {
                    minterAddress, contractAddress
                }
            );

        const tokens = await builder
            .limit(limit)
            .offset(offset)
            .orderBy('sbt.created_at', 'DESC')
            .getRawMany();

        const count = await builder.getCount();
        return {tokens, count};
    }

    /**
     * Count the number of group tokens by status
     * @param contractIds 
     * @returns 
     */
    countStatus(contractIds: Array<number>) {
        return this.createQueryBuilder('sbt')
            .select('sbt.smart_contract_id, COUNT(sbt.id) as quanity')
            .where({
                smart_contract_id: In(contractIds)
            })
            .groupBy('sbt.smart_contract_id, sbt.`status`')
            .getRawMany();
    }
}