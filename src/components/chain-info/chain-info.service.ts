import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateChainInfoDto } from './dto/create-chain-info.dto';
import { UpdateChainInfoDto } from './dto/update-chain-info.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ChainInfo } from '../../shared/entities/chain-info.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ChainInfoService {
  constructor(
    @InjectRepository(ChainInfo)
    private readonly chainInfoRepository: Repository<ChainInfo>,
  ) {}

  async create(createChainInfoDto: CreateChainInfoDto): Promise<ChainInfo> {
    return this.chainInfoRepository.save(createChainInfoDto);
  }

  async findAll(): Promise<{ data: ChainInfo[]; meta: { count: number } }> {
    const [data, count] = await this.chainInfoRepository.findAndCount({
      order: { updated_at: 'DESC', created_at: 'DESC' },
    });
    return { data: data || [], meta: { count: count || 0 } };
  }

  async findOne(id: number): Promise<ChainInfo> {
    const chainInfo = await this.chainInfoRepository.findOne(id);

    if (!chainInfo) {
      throw new NotFoundException('Chain not found.');
    }

    return chainInfo;
  }

  async update(
    id: number,
    updateChainInfoDto: UpdateChainInfoDto,
  ): Promise<ChainInfo> {
    const currentChainInfo = await this.chainInfoRepository.findOne(id);

    if (!currentChainInfo) {
      throw new NotFoundException('Chain not found.');
    }

    updateChainInfoDto.id = id;
    this.chainInfoRepository.merge(currentChainInfo, updateChainInfoDto);

    return this.chainInfoRepository.save(currentChainInfo);
  }

  async remove(id: number): Promise<void> {
    const chainInfo = await this.chainInfoRepository.findOne(id);

    if (!chainInfo) {
      throw new NotFoundException('Chain not found.');
    }

    this.chainInfoRepository.delete(id);
  }
}
