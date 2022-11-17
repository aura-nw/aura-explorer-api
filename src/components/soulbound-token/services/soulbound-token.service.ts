import { Injectable } from "@nestjs/common";
import { AkcLogger, RequestContext, SoulboundToken } from "../../../shared";
import { CreateSoulboundTokenParamsDto } from "../dtos/create-soulbound-token-params.dto";
import { SoulboundTokenRepository } from "../repositories/soulbound-token.repository";

@Injectable()
export class SoulboundTokenService {
    constructor(
        private readonly logger: AkcLogger,
        private soulboundTokenRepos: SoulboundTokenRepository
    ) {
    }

    async create(ctx: RequestContext, req: CreateSoulboundTokenParamsDto) {
        let entity = new SoulboundToken();

        return await this.soulboundTokenRepos.save(entity);
    }
}