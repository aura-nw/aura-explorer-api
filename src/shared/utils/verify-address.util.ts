import { Injectable } from '@nestjs/common';
import {
  ADMIN_ERROR_MAP,
  EVM_EXTENSIONS,
  LENGTH,
  NAME_TAG_TYPE,
  RPC_QUERY_URL,
} from '../constants';
import { Explorer } from '../entities/explorer.entity';
import * as util from 'util';
import { isAddress } from 'web3-validator';
import { isValidBench32Address } from './service.util';
import { RpcUtil } from './rpc.util';
import { Writer } from 'protobufjs';

@Injectable()
export class VerifyAddressUtil {
  constructor(private rpcUtil: RpcUtil) {}

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
      const validFormat = isAddress(address, true);
      // address is valid evm address
      if (validFormat) {
        // Query RPC check this address is contract or not.
        const res = await this.rpcUtil.queryComosRPC(
          RPC_QUERY_URL.EVM_CODES_ADDRESS,
          Writer.create().uint32(10).string(address).finish(),
          explorer.chainId,
        );
        const isContract =
          res?.result.response.value || EVM_EXTENSIONS.includes(address)
            ? true
            : false;
        // Check valid type address
        if (
          (type === NAME_TAG_TYPE.CONTRACT && !isContract) ||
          (type === NAME_TAG_TYPE.ACCOUNT && isContract)
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
}
