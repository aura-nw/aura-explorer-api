import { SmartContractCode } from "../../../shared/entities/smart-contract-code.entity";
import { EntityRepository, ObjectLiteral, Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";

@EntityRepository(SmartContractCode)
export class SmartContractCodeRepository extends Repository<SmartContractCode> {
    constructor(@InjectRepository(SmartContractCode) private readonly repos: Repository<ObjectLiteral>) {
        super();
    }
}