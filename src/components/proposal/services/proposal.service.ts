import { HttpService } from "@nestjs/axios";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AkcLogger } from "../../../shared";

@Injectable()
export class ProposalService {
    constructor(
        private readonly logger: AkcLogger,
        private configService: ConfigService,
        private httpService: HttpService,
    ) {
        this.logger.setContext(ProposalService.name);
    }

}