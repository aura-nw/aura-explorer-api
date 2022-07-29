import { Injectable } from "@nestjs/common";
import { AkcLogger, RequestContext } from "../../../shared";
import { Cw20TokenParamsDto } from "../dtos/cw20-token-params.dto";
import * as appConfig from '../../../shared/configs/configuration';

@Injectable()
export class Cw20TokenService {
    private api;
    private indexerUrl;
    private indexerChainId;

    constructor(
        private readonly logger: AkcLogger
    ) {
        this.logger.setContext(Cw20TokenService.name);
        const appParams = appConfig.default();
        this.api = appParams.node.api;
        this.indexerUrl = appParams.indexer.url;
        this.indexerChainId = appParams.indexer.chainId;
    }

    async getCw20Tokens(ctx: RequestContext, request: Cw20TokenParamsDto): Promise<any> {
        this.logger.log(ctx, `${this.getCw20Tokens.name} was called!`);
        

        return { contracts: [], count: 0 };
    }
}