import { SmartContractCode } from "../../../shared/entities/smart-contract-code.entity";
import { EntityRepository, ObjectLiteral, Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { SmartContract } from "../../../shared/entities/smart-contract.entity";
import { CONTRACT_CODE_RESULT, CONTRACT_STATUS } from "../../../shared";

@EntityRepository(SmartContractCode)
export class SmartContractCodeRepository extends Repository<SmartContractCode> {
    constructor(@InjectRepository(SmartContractCode) private readonly repos: Repository<ObjectLiteral>) {
        super();
    }
}