import { SmartContract } from "../../../shared/entities/smart-contract.entity";
import { EntityRepository, ObjectLiteral, Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";

@EntityRepository(SmartContract)
export class ContractRepository extends Repository<SmartContract> {
    constructor(@InjectRepository(SmartContract) private readonly repos: Repository<ObjectLiteral>) {
        super();
    }
}