import { SmartContract } from "../../../shared/entities/smart-contract.entity";
import { EntityRepository, ObjectLiteral, Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { ContractParamsDto } from "../dtos/contract-params.dto";
import { CONTRACT_STATUS, TokenContract } from "../../../shared";

@EntityRepository(SmartContract)
export class SmartContractRepository extends Repository<SmartContract> {
    constructor(@InjectRepository(SmartContract) private readonly repos: Repository<ObjectLiteral>) {
        super();
    }

    async getContracts(request: ContractParamsDto) {
        let result = [];
        let params = [];
        let sqlSelect: string = `SELECT sc.*, scc.type, scc.result`;
        let sqlCount: string = `SELECT COUNT(sc.Id) AS total`;
        let sql: string = ` FROM smart_contracts sc
            LEFT JOIN smart_contract_codes scc ON sc.code_id = scc.code_id`;
        if (request?.keyword) {
            sql += ` WHERE LOWER(sc.contract_name) LIKE '%?%'`;
            params.push(request.keyword.toLowerCase());
        }
        sql += " ORDER BY sc.updated_at DESC";
        let sqlLimit = "";
        if (request.limit > 0) {
            sqlLimit = " LIMIT ? OFFSET ?";
            params.push(request.limit);
            params.push(request.offset);
        }

        result[0] = await this.query(sqlSelect + sql + sqlLimit, params);
        result[1] = await this.query(sqlCount + sql, params);
        return result;
    }

    /**
    * Get list code id
    * @param creatorAddress: Creator address
    * @returns List code id (number[])
    */
    async getCodeIds(creatorAddress: string) {
        return await this.createQueryBuilder('sm')
            .select('sm.code_id AS codeId')
            .distinct(true)
            .where(`sm.contract_verification != '${CONTRACT_STATUS.UNVERIFIED}'
                AND sm.mainnet_upload_status NOT IN('${CONTRACT_STATUS.DEPLOYED}', '${CONTRACT_STATUS.TBD}')
                AND sm.creator_address=:creatorAddress`)
            .setParameter('creatorAddress', creatorAddress)
            .getRawMany();
    }


    /**
     * Get list contract by Creator address
     * @param creatorAddress 
     * @returns List contract(any[])
     */
    async getContractByCreator(creatorAddress: string, codeId: number, status: string, limit: number, offset: number) {
        let conditions = `creator_address=:creatorAddress`;
        const params = { creatorAddress };

        if (codeId) {
            conditions += ` AND sm.code_id LIKE :codeId`
            params['codeId'] = `%${codeId}%`;
        }

        if (status) {
            if (status === CONTRACT_STATUS.UNVERIFIED
                || status === CONTRACT_STATUS.EXACT_MATCH
                || status === CONTRACT_STATUS.SIMILAR_MATCH) {
                    conditions += ` AND sm.contract_verification=:status`

            } else {
                conditions += ` AND sm.mainnet_upload_status=:status`
            }
            params['status'] = status;
        }

        let constracts = await this.createQueryBuilder('sm')
            .select(`sm.*, tokenContract.type, (CASE WHEN(
                sm.contract_verification = '${CONTRACT_STATUS.UNVERIFIED}'
                OR sm.contract_verification = '${CONTRACT_STATUS.SIMILAR_MATCH}'
                OR sm.contract_verification = '${CONTRACT_STATUS.EXACT_MATCH}'
            ) THEN sm.contract_verification ELSE sm.mainnet_upload_status END) AS status`)
            .innerJoin(TokenContract, 'tokenContract', 'tokenContract.contract_address=sm.contract_address')
            .distinct(true)
            .where(conditions)
            .setParameters(params)
            .take(limit)
            .skip(offset)
            .getRawMany();

        let count = await this.createQueryBuilder('sm')
            .select(`COUNT(DISTINCT sm.id) AS total`)
            .innerJoin(TokenContract, 'tokenContract', 'tokenContract.contract_address=sm.contract_address')
            .where(conditions)
            .setParameters(params)
            .getRawOne();

        return [constracts, Number(count?.total) || 0];
    }
}