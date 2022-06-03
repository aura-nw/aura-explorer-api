import { InjectRepository } from "@nestjs/typeorm";
import { TokenContract } from "../../../shared";
import { EntityRepository, ObjectLiteral, Repository } from "typeorm";

@EntityRepository(TokenContract)
export class TokenContractRepository extends Repository<TokenContract> {
    constructor(@InjectRepository(TokenContract) private readonly repos: Repository<ObjectLiteral>) {
        super();
    }
}