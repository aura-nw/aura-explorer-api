import { Injectable } from "@nestjs/common";
import { AkcLogger } from "../../../shared";

@Injectable()
export class Cw20TokenService {
    constructor(
        private readonly logger: AkcLogger
    ) {
        this.logger.setContext(Cw20TokenService.name);
    }
}