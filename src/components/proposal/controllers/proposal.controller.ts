import { Controller, Get } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
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

    // @Get('')
    // @ApiOperation({ summary: 'Get list proposal' })
    
}