import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { AkcLogger } from '../logger/logger.service';
import { lastValueFrom } from 'rxjs';
import axios from 'axios';
import { bech32 } from 'bech32';
import { ConfigService } from '@nestjs/config';
import {
  AURA_INFO,
  COSMOS,
  CW4973_CONTRACT,
  DEFAULT_IPFS,
  EVM_ADDRESS_PREFIX,
  NAME_TAG_TYPE,
} from '../constants';
import { sha256 } from 'js-sha256';
import { fromBech32, toBech32 } from '@cosmjs/encoding';
import { stripHexPrefix, toChecksumAddress } from 'crypto-addr-codec';

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
}

export function secondsToDate(seconds: number): Date {
  const secondsToMilliseconds = 1000;
  return new Date(seconds * secondsToMilliseconds);
}

export function isValidBench32Address(
  address: string,
  prefix = AURA_INFO.ADDRESS_PREFIX.toString(),
  type?: string,
): boolean {
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

    const addressHexLength = address.length - decodedPrefix.length;

    switch (type) {
      case NAME_TAG_TYPE.ACCOUNT:
        return addressHexLength === COSMOS.ADDRESS_LENGTH.ACCOUNT_HEX;
      case NAME_TAG_TYPE.CONTRACT:
        return addressHexLength === COSMOS.ADDRESS_LENGTH.CONTRACT_HEX;
    }

    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Creates a Bech32 encoder function with the given prefix.
 *
 * @param {string} prefix - The prefix for the Bech32 encoding.
 * @return {function} - A function that accepts a Buffer and returns the Bech32 encoded string.
 */
function makeBech32Encoder(prefix: string) {
  return (data: Buffer) => toBech32(prefix, data);
}

/**
 * Returns a function that decodes a Bech32 string into a Buffer, using the provided currentPrefix.
 *
 * @param {string} input - The Bech32 string to decode.
 * @return {Buffer} The decoded Buffer.
 */
function makeBech32Decoder(currentPrefix: string) {
  return (input: string) => {
    const { prefix, data } = fromBech32(input);
    if (prefix !== currentPrefix) {
      throw Error('Unrecognised address format');
    }
    return Buffer.from(data);
  };
}

/**
 * Creates a checksummed hex decoder function.
 *
 * @return {(data: string) => Buffer} The checksummed hex decoder function
 */
function makeChecksummedHexDecoder() {
  return (data: string) => {
    return Buffer.from(stripHexPrefix(data), 'hex');
  };
}

/**
 * Returns a function that takes a Buffer and returns the checksummed hex encoding of the data.
 *
 * @param {number} chainId - The chain ID to be used for checksum calculation (optional)
 * @return {Function} - A function that takes a Buffer and returns the checksummed hex encoding
 */
function makeChecksummedHexEncoder(chainId?: number) {
  return (data: Buffer) =>
    toChecksumAddress(data.toString('hex'), chainId || null);
}

/**
 * Converts a Bech32 address to an EVM address.
 *
 * @param {string} prefix - The prefix of the Bech32 address.
 * @param {string} bech32Address - The Bech32 address to be converted.
 * @return {string} The converted EVM address.
 */
export function convertBech32AddressToEvmAddress(
  prefix: string,
  bech32Address: string,
): string {
  try {
    const data = makeBech32Decoder(prefix)(bech32Address);
    return makeChecksummedHexEncoder()(data)?.toLowerCase();
  } catch (err) {
    return null;
  }
}

/**
 * Converts an EVM address to a Bech32 address with the specified prefix.
 *
 * @param {string} prefix - The prefix for the Bech32 address
 * @param {string} ethAddress - The Ethereum address to convert
 * @return {string} The converted Bech32 address
 */
export function convertEvmAddressToBech32Address(
  prefix: string,
  ethAddress: string,
): string {
  let result = ethAddress;
  if (result.startsWith(EVM_ADDRESS_PREFIX)) {
    try {
      const data = makeChecksummedHexDecoder()(ethAddress);
      result = makeBech32Encoder(prefix)(data);
    } catch (err) {
      return null;
    }
  }
  return result?.toLowerCase();
}
