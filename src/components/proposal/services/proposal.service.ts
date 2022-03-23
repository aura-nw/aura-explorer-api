import { HttpService } from "@nestjs/axios";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AkcLogger, RequestContext } from "../../../shared";
import { ProposalOutput } from "../dtos/proposal-output.dto";
import { ProposalRepository } from "../repositories/proposal.repository";
import { plainToClass } from 'class-transformer';

@Injectable()
export class ProposalService {
    constructor(
        private readonly logger: AkcLogger,
        private configService: ConfigService,
        private httpService: HttpService,
        private proposalRepository: ProposalRepository
    ) {
        this.logger.setContext(ProposalService.name);
    }

    async getProposals(
        ctx: RequestContext
    ): Promise<{ proposals: ProposalOutput[]; count: number }> {
        this.logger.log(ctx, `${this.getProposals.name} was called!`);

        const [proposals, count] = await this.proposalRepository.findAndCount({
            order: {pro_id: 'DESC'}
        });

        const proposalsOuput = plainToClass(ProposalOutput, proposals, {
            excludeExtraneousValues: true,
        });

        return { proposals: proposalsOuput, count };
    }
}