import { BadRequestException, Injectable } from '@nestjs/common';
import {
  ADMIN_ERROR_MAP,
  INDEXER_API_V2,
  LENGTH,
  NAME_TAG_TYPE,
} from '../constants';
import { Explorer } from '../entities/explorer.entity';
import { Keccak } from 'sha3';
import * as util from 'util';
import { ServiceUtil, isValidBench32Address } from './service.util';

@Injectable()
export class VerifyAddressUtil {
  constructor(private serviceUtil: ServiceUtil) {}

  async verify(address: string, type: NAME_TAG_TYPE, explorer: Explorer) {
    // adrress is cosmos address
    if (address.startsWith(explorer.addressPrefix)) {
      const validFormat = isValidBench32Address(
        address,
        explorer.addressPrefix,
      );
      // Remove prefix address
      const addressNoPrefix = address.replace(explorer.addressPrefix, '');
      // Check valid type address
      if (
        !validFormat ||
        (addressNoPrefix.length === LENGTH.CONTRACT_ADDRESS_NO_PREFIX &&
          type !== NAME_TAG_TYPE.CONTRACT) ||
        (addressNoPrefix.length === LENGTH.ACCOUNT_ADDRESS_NO_PREFIX &&
          type !== NAME_TAG_TYPE.ACCOUNT)
      ) {
        return {
          code: ADMIN_ERROR_MAP.INVALID_FORMAT.Code,
          message: util.format(
            ADMIN_ERROR_MAP.INVALID_FORMAT.Message,
            explorer.addressPrefix,
          ),
        };
      }
      return false;
    } else {
      const validFormat = this.isValidEvmAddress(address);
      // address is valid evm address
      if (validFormat) {
        const graphQlQuery = {
          query: util.format(
            INDEXER_API_V2.GRAPH_QL.FIND_EVM_SMART_CONTRACT,
            explorer.chainDb,
          ),
          variables: {
            address: address,
          },
          operationName: INDEXER_API_V2.OPERATION_NAME.FIND_EVM_SMART_CONTRACT,
        };
        // Query horoscope check this address is contract or not.
        const response = (
          await this.serviceUtil.fetchDataFromGraphQL(graphQlQuery)
        )?.data[explorer.chainDb];
        // Check valid type address
        if (
          (type === NAME_TAG_TYPE.CONTRACT &&
            response?.evm_smart_contract?.length <= 0) ||
          (type === NAME_TAG_TYPE.ACCOUNT &&
            response?.evm_smart_contract?.length > 0)
        ) {
          return {
            code: ADMIN_ERROR_MAP.INVALID_EVM_FORMAT.Code,
            message: ADMIN_ERROR_MAP.INVALID_EVM_FORMAT.Message,
          };
        }
        return false;
      } else {
        // address is no valid evm address
        return {
          code: ADMIN_ERROR_MAP.INVALID_EVM_FORMAT.Code,
          message: ADMIN_ERROR_MAP.INVALID_EVM_FORMAT.Message,
        };
      }
    }
  }

  isValidEvmAddress(address: string): boolean {
    if (!address) {
      return false;
    }

    try {
      const stripped = this.stripHexPrefix(address);
      if (
        !this.isValidChecksumAddress(address) &&
        stripped !== stripped.toLowerCase() &&
        stripped !== stripped.toUpperCase()
      ) {
        throw Error('Invalid address checksum');
      }
      return true;
    } catch (error) {
      return false;
    }
  }

  isValidChecksumAddress(address) {
    return (
      this.isValidAddress(address) &&
      this.toChecksumAddress(address) === address
    );
  }

  isValidAddress(address) {
    return /^0x[0-9a-fA-F]{40}$/.test(address);
  }

  stripHexPrefix = (str) => {
    return str.slice(0, 2) === '0x' ? str.slice(2) : str;
  };

  toChecksumAddress = (address, chainId = null) => {
    if (typeof address !== 'string') {
      throw new BadRequestException(
        "stripHexPrefix param must be type 'string', is currently type " +
          typeof address +
          '.',
      );
    }
    const stripAddress = this.stripHexPrefix(address).toLowerCase();
    const prefix = chainId != null ? chainId.toString() + '0x' : '';
    const keccakHash = new Keccak(256)
      .update(prefix + stripAddress)
      .digest()
      .toString('hex');
    let output = '0x';

    for (let i = 0; i < stripAddress.length; i++)
      output +=
        parseInt(keccakHash[i], 16) >= 8
          ? stripAddress[i].toUpperCase()
          : stripAddress[i];
    return output;
  };
}
