import {
  Injectable,
  InternalServerErrorException,
  OnModuleInit,
} from '@nestjs/common';
import { AkcLogger } from '../logger/logger.service';
import { ConfigService } from '@nestjs/config';
import { AURA_INFO } from '../constants';
import { HttpBatchClient } from '@cosmjs/tendermint-rpc';
import { toHex } from '@cosmjs/encoding';
import { JsonRpcRequest } from '@cosmjs/json-rpc';
import { InjectRepository } from '@nestjs/typeorm';
import { Explorer } from '../entities/explorer.entity';
import { Repository } from 'typeorm';

@Injectable()
export class RpcUtil implements OnModuleInit {
  private listBatch: Array<any> = [];

  constructor(
    private readonly logger: AkcLogger,
    private configService: ConfigService,
    @InjectRepository(Explorer)
    private readonly explorerRepository: Repository<Explorer>,
  ) {}

  async onModuleInit() {
    try {
      const explorer = await this.explorerRepository.find({});
      explorer?.forEach((item) => {
        this.listBatch.push({
          chainId: item.chainId,
          batchClient: new HttpBatchClient(
            this.configService.get(
              item.name === AURA_INFO.NAME
                ? 'RPC'
                : `${item.name.toUpperCase()}_RPC`,
            ),
            {
              batchSizeLimit: 100,
              dispatchInterval: 100, // millisec
            },
          ),
        });
      });
    } catch (error) {
      this.logger.error(
        null,
        `Error while create instance batchClient from RPC! ${error}`,
      );
      throw new InternalServerErrorException(error);
    }
  }

  async queryComosRPC(path: string, data: Uint8Array, chainId: string) {
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
      const batch = this.listBatch.find((item) => item.chainId === chainId);
      return await batch?.batchClient.execute(request);
    } catch (error) {
      this.logger.error(
        null,
        `Error while querying ${path} from RPC! ${error}`,
      );
      throw new InternalServerErrorException(error);
    }
  }
}
