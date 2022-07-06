import { SmartContract } from "../../../shared/entities/smart-contract.entity";
import { EntityRepository, ObjectLiteral, Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { ContractParamsDto } from "../dtos/contract-params.dto";

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
            sql += ` WHERE sc.contract_name LIKE '%${request.keyword}%'`;
        }
        sql += " ORDER BY sc.updated_at DESC";
        let sqlLimit = " LIMIT ? OFFSET ?";
        params.push(request.limit);
        params.push(request.offset);
    
        result[0] = await this.query(sqlSelect + sql + sqlLimit, params);
        result[1] = await this.query(sqlCount + sql, params);
        return result;
      }
}