import { Injectable } from "@nestjs/common";
import { AkcLogger } from "../../../shared";
import { ContractCodeRepository } from "../repositories/contract-code.repository";

@Injectable()
export class ContractCodeService {
    constructor(
        private readonly logger: AkcLogger,
        private contractCodeRepository: ContractCodeRepository
    ) {
        this.logger.setContext(ContractCodeService.name);
    }
}