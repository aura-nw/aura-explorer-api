import { HttpService } from "@nestjs/axios";
import { Injectable } from "@nestjs/common";
import { AkcLogger } from "../logger/logger.service";
import { lastValueFrom } from 'rxjs';

@Injectable()
export class ServiceUtil {
    constructor(
        private readonly logger: AkcLogger,
        private httpService: HttpService) {

    }

    /**
     * getDataAPI
     * @param api 
     * @param params 
     * @param ctx 
     * @returns 
     */
    async getDataAPI(api, params, ctx) {
        this.logger.log(
            ctx,
            `${this.getDataAPI.name} was called, to ${api + params}!`,
        );
        try {
            const data = await lastValueFrom(this.httpService.get(api + params)).then(
                (rs) => rs.data,
            );
            return data;

        } catch (err) {
            return null;
        }
    }
}