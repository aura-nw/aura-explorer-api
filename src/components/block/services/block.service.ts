import { HttpService } from '@nestjs/axios';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { plainToClass } from 'class-transformer';
import { lastValueFrom } from 'rxjs';

import { AkcLogger, RequestContext } from '../../../shared';

import { BlockParamsDto } from '../dtos/block-params.dto';
import { BlockOutput, LiteBlockOutput } from '../dtos/block-output.dto';
import { BlockRepository } from '../repositories/block.repository';

import { TransactionService } from '../../transaction/services/transaction.service';

@Injectable()
export class BlockService {
  constructor(
    private readonly logger: AkcLogger,
    private httpService: HttpService,
    private configService: ConfigService,
    private blockRepository: BlockRepository,
    private txService: TransactionService,
  ) {
    this.logger.setContext(BlockService.name);
  }

  async getBlocks(
    ctx: RequestContext,
    query: BlockParamsDto,
  ): Promise<{ blocks: LiteBlockOutput[]; count: number }> {
    this.logger.log(ctx, `${this.getBlocks.name} was called!`);

    // this.logger.log(ctx, `calling get latest blocks from node`);
    // const rpc = this.configService.get<string>('node.rpc');
    // const payload = {
    //   jsonrpc: '2.0',
    //   id: 1,
    //   method: 'blockchain',
    //   params: ['0', '0'],
    // };
    // const data = await lastValueFrom(this.httpService.post(rpc, payload)).then(
    //   (rs) => rs.data,
    // );

    // // handle data
    // if (typeof data.error != 'undefined') {
    //   throw new InternalServerErrorException();
    // }
    // const blocks = [];
    // if (typeof data.result != 'undefined') {
    //   for (const block of data.result.block_metas) {
    //     blocks.push({
    //       height: block.header.height,
    //       block_hash: block.block_id.hash,
    //       num_txs: block.num_txs,
    //       timestamp: block.header.time,
    //     });
    //     if (blocks.length == query.limit) break;
    //   }
    // }

    const [blocks, count] = await this.blockRepository.findAndCount({
      order: { height: 'DESC' },
      take: query.limit,
      skip: query.offset,
    });

    const blocksOutput = plainToClass(LiteBlockOutput, blocks, {
      excludeExtraneousValues: true,
    });

    return { blocks: blocksOutput, count };
  }

  async getBlockByHeight(ctx: RequestContext, height): Promise<any> {
    this.logger.log(ctx, `${this.getBlockByHeight.name} was called!`);

    const blockOutput = await this.blockRepository.findOne({
      where: { height: height },
    });
    const txs = await this.txService.getTxsByBlockHeight(height);

    return { ...blockOutput, txs };
  }

  async getBlockById(ctx: RequestContext, blockId): Promise<any> {
    this.logger.log(ctx, `${this.getBlockByHeight.name} was called!`);

    const blockOutput = await this.blockRepository.findOne(blockId);
    const txs = await this.txService.getTxsByBlockHeight(blockId);

    return { ...blockOutput, txs };
  }
}
