import { HttpService } from '@nestjs/axios';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { AkcLogger } from '../logger/logger.service';
import { lastValueFrom } from 'rxjs';
import axios from 'axios';
import { bech32 } from 'bech32';
import { ConfigService } from '@nestjs/config';
import { AURA_INFO } from '../constants';
@Injectable()
export class ServiceUtil {
  private readonly indexerV2;

  constructor(
    private readonly logger: AkcLogger,
    private httpService: HttpService,
    private configService: ConfigService,
  ) {
    this.indexerV2 = this.configService.get('indexerV2');
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

  async fetchDataFromGraphQL(query, endpoint?, method?) {
    this.logger.log(query, `${this.fetchDataFromGraphQL.name} was called`);
    endpoint = endpoint ? endpoint : this.indexerV2.graphQL;
    method = method ? method : 'POST';

    try {
      const response = await axios({
        url: endpoint,
        method: method,
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

  async isValidBech32Address(address: string): Promise<any> {
    const prefix = AURA_INFO.ADDRESS_PREFIX;

    if (!address) {
      return false;
    }

    try {
      const { prefix: decodedPrefix } = bech32.decode(address);

      if (prefix !== decodedPrefix) {
        throw new Error(
          `Unexpected prefix (expected: ${prefix}, actual: ${decodedPrefix}`,
        );
      }

      return true;
    } catch (error) {
      return false;
    }
  }

  async getDataAPI(api, params) {
    return lastValueFrom(
      this.httpService.get(api + params, {
        timeout: 30000,
      }),
    ).then((rs) => rs.data);
  }

  async getDataAPIWithHeader(api, params, headersRequest) {
    return lastValueFrom(
      this.httpService.get(api + params, {
        timeout: 30000,
        headers: headersRequest,
      }),
    ).then((rs) => rs.data);
  }

  async getDataRPC(rpc, params) {
    const data = await lastValueFrom(this.httpService.get(rpc + params)).then(
      (rs) => rs.data,
    );

    if (typeof data.error != CONST_CHAR.UNDEFINED) {
      throw new InternalServerErrorException();
    }
    if (typeof data.result != CONST_CHAR.UNDEFINED) {
      return data.result;
    } else {
      return '';
    }
  }

  /**
   * Create token Id
   * @param chainID
   * @param active
   * @param passive
   * @param uri
   * @returns
   */
  createTokenId(
    chainID: string,
    active: string,
    passive: string,
    uri: string,
  ): string {
    try {
      const message: string = this.createMessageToSign(
        chainID,
        active,
        passive,
        uri,
      );
      return sha256(message);
    } catch (err) {
      console.log(err);
    }
  }

  /**
   * Create message sign
   * @param chainID
   * @param active
   * @param passive
   * @param uri
   * @returns
   */
  private createMessageToSign(
    chainID: string,
    active: string,
    passive: string,
    uri: string,
  ) {
    const message =
      CW4973_CONTRACT.AGREEMENT + chainID + active + passive + uri;
    const doc: any = {
      account_number: '0',
      chain_id: '',
      fee: {
        amount: [],
        gas: '0',
      },
      memo: '',
      msgs: [
        {
          type: 'sign/MsgSignData',
          value: {
            data: Buffer.from(message, 'utf8').toString('base64'),
            signer: String(passive),
          },
        },
      ],
      sequence: '0',
    };
    return JSON.stringify(doc);
  }

  transform(value: string): string {
    if (!value.includes('https://ipfs.io/')) {
      return ENV_CONFIG.IPFS_URL + value.replace('://', '/');
    } else {
      return value.replace('https://ipfs.io/', ENV_CONFIG.IPFS_URL);
    }
  }
}

export function secondsToDate(seconds: number): Date {
  const secondsToMilliseconds = 1000;
  return new Date(seconds * secondsToMilliseconds);
}
