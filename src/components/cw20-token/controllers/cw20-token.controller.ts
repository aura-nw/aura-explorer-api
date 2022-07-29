import { Controller } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { AkcLogger } from "../../../shared";
import { Cw20TokenService } from "../services/cw20-token.service";

@ApiTags('cw20-tokens')
@Controller('cw20-tokens')
export class Cw20TokenController {
    constructor(
        private readonly cw20TokenService: Cw20TokenService,
        private readonly logger: AkcLogger,
    ) {
        this.logger.setContext(Cw20TokenController.name);
    }
}