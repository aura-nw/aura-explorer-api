import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { AkcLogger } from '../logger/logger.service';
import { lastValueFrom } from 'rxjs';
import axios from 'axios';
import { bech32 } from 'bech32';
import { ConfigService } from '@nestjs/config';
import { AURA_INFO, CW4973_CONTRACT, DEFAULT_IPFS } from '../constants';
import { sha256 } from 'js-sha256';
import { HttpBatchClient } from '@cosmjs/tendermint-rpc';
import { toHex } from '@cosmjs/encoding';
import { JsonRpcRequest } from '@cosmjs/json-rpc';

@Injectable()
export class ServiceUtil {
  private readonly indexerV2;
  private batchClient: HttpBatchClient;
  constructor(
    private readonly logger: AkcLogger,
    private httpService: HttpService,
    private configService: ConfigService,
  ) {
    this.indexerV2 = this.configService.get('indexerV2');
    this.batchClient = new HttpBatchClient(this.configService.get('node.rpc'), {
      batchSizeLimit: 100,
      dispatchInterval: 100, // millisec
    });
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

  /**
   * getDataAPIWithHeader
   * @param api
   * @param params
   * @param ctx
   * @returns
   */
  async getDataAPIWithHeader(api, params, headersRequest) {
    try {
      return lastValueFrom(
        this.httpService.get(api + params, {
          timeout: 30000,
          headers: headersRequest,
        }),
      ).then((rs) => rs.data);
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
    const ipfsUrl = this.configService.get('ipfsUrl');
    if (!value.includes(DEFAULT_IPFS)) {
      return ipfsUrl + value.replace('://', '/');
    } else {
      return value.replace(DEFAULT_IPFS, ipfsUrl);
    }
  }

  async queryComosRPC(path: string, data: Uint8Array) {
    try {
      const request: JsonRpcRequest = {
        jsonrpc: '2.0',
        id: Math.floor(Math.random() * 10000000),
        method: 'abci_query',
        params: {
          path: path,
          data: toHex(data),
        },
      };
      return await this.batchClient.execute(request);
    } catch (error) {
      this.logger.error(
        null,
        `Error while querying ${path} from RPC! ${error}`,
      );
      return null;
    }
  }
}

export function secondsToDate(seconds: number): Date {
  const secondsToMilliseconds = 1000;
  return new Date(seconds * secondsToMilliseconds);
}

export async function isValidBench32Address(
  address: string,
  prefix?: string,
): Promise<any> {
  if (!address) {
    return false;
  }

  if (!prefix) prefix = AURA_INFO.ADDRESS_PREFIX;

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
