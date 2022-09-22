import { InjectRepository } from "@nestjs/typeorm";
import { EntityRepository, ObjectLiteral, Repository } from "typeorm";
import { SmartContractCode } from "../../../shared/entities/smart-contract-code.entity";

@EntityRepository(SmartContractCode)
export class SmartContractCodeRepository extends Repository<SmartContractCode> {
    constructor(@InjectRepository(SmartContractCode) private readonly repos: Repository<ObjectLiteral>) {
        super();
    }
}