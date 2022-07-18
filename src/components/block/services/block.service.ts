import { HttpService } from '@nestjs/axios';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { plainToClass } from 'class-transformer';

import { AkcLogger, RequestContext } from '../../../shared';

import { BlockParamsDto } from '../dtos/block-params.dto';
import { BlockRepository } from '../repositories/block.repository';

import { TransactionService } from '../../transaction/services/transaction.service';
import { MissedBlockRepository } from '../../../components/schedule/repositories/missed-block.repository';
import { ValidatorRepository } from '../../../components/validator/repositories/validator.repository';
import { LiteBlockOutput } from '../dtos/lite-block-output.dto';
import { BlockLatestDto } from '../dtos/block-latest-params.dto';

@Injectable()
export class BlockService {
  constructor(
    private readonly logger: AkcLogger,
    private httpService: HttpService,
    private configService: ConfigService,
    private blockRepository: BlockRepository,
    private txService: TransactionService,
    private missedBlockRepository: MissedBlockRepository,
    private validatorRepository: ValidatorRepository,
  ) {
    this.logger.setContext(BlockService.name);
  }

  async getTotalBlock(): Promise<number> {
    return await this.blockRepository.count();
  }

  async getBlocks(
    ctx: RequestContext,
    query: BlockParamsDto,
  ): Promise<{ blocks: LiteBlockOutput[]; count: number }> {
    this.logger.log(ctx, `${this.getBlocks.name} was called!`);

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
    const txs = await this.txService.getTxsByBlockHeight(blockOutput?.height);

    return { ...blockOutput, txs };
  }

  async getDataBlocks(
    ctx: RequestContext,
    limit: number,
    offset: number,
  ): Promise<{ blocks: LiteBlockOutput[]; count: number }> {
    this.logger.log(ctx, `${this.getDataBlocks.name} was called!`);

    const [blocks, count] = await this.blockRepository.findAndCount({
      order: { height: 'DESC' },
      take: limit,
      skip: offset,
    });

    const blocksOutput = plainToClass(LiteBlockOutput, blocks, {
      excludeExtraneousValues: true,
    });

    return { blocks: blocksOutput, count };
  }

  async getBlockByValidatorAddress(
    ctx: RequestContext,
    validatorAddress,
    query: BlockParamsDto,
  ): Promise<{ blocks: LiteBlockOutput[]; count: number }> {
    this.logger.log(ctx, `${this.getBlockByValidatorAddress.name} was called!`);
    query.limit = 5;

    const [blocks, count] = await this.blockRepository.findAndCount({
      where: { operator_address: validatorAddress },
      order: { height: 'DESC' },
      take: query.limit,
      skip: query.offset,
    });

    const blocksOutput = plainToClass(LiteBlockOutput, blocks, {
      excludeExtraneousValues: true,
    });

    return { blocks: blocksOutput, count };
  }

  async getBlockLatest(
    ctx: RequestContext,
    query: BlockParamsDto,
  ): Promise<{ blocks: LiteBlockOutput[]; count: number }> {
    this.logger.log(ctx, `${this.getBlockLatest.name} was called!`);
    query.limit = 100;

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

  /**
   * Get latest top 100 blocks and latest missing 100 blocks by validator address for uptime detection
   * @param address: Validator address
   * @returns 
   */
  async getDataBlocksByAddress(
    ctx: RequestContext,
    validatorAddress: string,
  ): Promise<{ blocks: LiteBlockOutput[] }> {
    this.logger.log(ctx, `${this.getDataBlocks.name} was called with Validator address: ${validatorAddress}`);

    const results: [] = await this.blockRepository.getBlockUptime(validatorAddress, 100);
    let outputs = [];

    outputs = results.map((item: any) => {
      return { height: item.height, block_hash: item.block_hash, isMissed: Number(item.isMissed) };
    });

    return { blocks: outputs };
  }

  async getTopBlocks(
    ctx: RequestContext,
    query: BlockLatestDto,
  ): Promise<{ blocks: LiteBlockOutput[]}> {
    this.logger.log(ctx, `${this.getBlocks.name} was called!`);

    const blocks = await this.blockRepository.find({
      order: { height: 'DESC' },
      take: query.limit,
    });

    const blocksOutput = plainToClass(LiteBlockOutput, blocks, {
      excludeExtraneousValues: true,
    });

    return { blocks: blocksOutput};
  }
}
