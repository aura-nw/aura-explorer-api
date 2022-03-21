import { Controller } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { AkcLogger } from "../../../shared";
import { ProposalService } from "../services/proposal.service";

@ApiTags('proposals')
@Controller('proposals')
export class ProposalController {
    constructor(
        private readonly proposalService: ProposalService,
        private readonly logger: AkcLogger
    ) {
        this.logger.setContext(ProposalController.name);
    }
}