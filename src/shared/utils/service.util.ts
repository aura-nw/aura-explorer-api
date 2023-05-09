import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { AkcLogger } from '../logger/logger.service';
import { lastValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
@Injectable()
export class ServiceUtil {
  private readonly indexerV2;

  constructor(
    private readonly logger: AkcLogger,
    private httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.indexerV2 = this.configService.get<string>('indexerV2');
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

  async fetchDataFromGraphQL(query, endpoint?, headers?, method?) {
    this.logger.log(query, `${this.fetchDataFromGraphQL.name} was called`);
    const defaultHeaders = {
      'content-type': 'application/json',
      'x-hasura-admin-secret': this.indexerV2.secret,
    };
    endpoint = endpoint ? endpoint : this.indexerV2.graphQL;
    headers = headers ? headers : defaultHeaders;
    method = method ? method : 'POST';

    try {
      const response = await axios({
        url: endpoint,
        method: method,
        headers: headers,
        data: query,
        timeout: 30000,
      });

      if (response.data?.errors?.length > 0) {
        this.logger.error(
          response.data.errors,
          `Error while querying from graphql! ${JSON.stringify(
            response.data.errors,
          )}`,
        );
        return null;
      }

      return response.data;
    } catch (error) {
      this.logger.error(query, `Error while querying from graphql! ${error}`);
      return null;
    }
  }
}
