import { Controller } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { AkcLogger } from "../../../shared";
import { ContractCodeService } from "../services/contract-code.service";

@ApiTags('contract-codes')
@Controller('contract-codes')
export class ContractCodeController {
    constructor(
        private readonly contractCodeService: ContractCodeService,
        private readonly logger: AkcLogger,
    ) {
        this.logger.setContext(ContractCodeController.name);
    }
}