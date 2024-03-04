import { Injectable } from '@nestjs/common';
import { AkcLogger, Asset, RequestContext } from '../../../shared';
import { AssetsRepository } from '../../asset/repositories/assets.repository';
import { AssetParamsDto } from '../dtos/asset-params.dto';
import { AssetsTokenMarketParamsDto } from '../dtos/cw20-token-market-params.dto';
import { In, MoreThan, Not, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { TokenHolderStatistic } from 'src/shared/entities/token-holder-statistic.entity';
import * as moment from 'moment';
import { Explorer } from 'src/shared/entities/explorer.entity';

@Injectable()
export class AssetService {
  constructor(
    private readonly logger: AkcLogger,
    private assetsRepository: AssetsRepository,
    @InjectRepository(TokenHolderStatistic)
    private readonly tokenHolderStatisticRepo: Repository<TokenHolderStatistic>,
    @InjectRepository(Explorer)
    private explorerRepository: Repository<Explorer>,
  ) {}

  async getAssets(ctx: RequestContext, param: AssetParamsDto) {
    this.logger.log(ctx, `${this.getAssets.name} was called!`);
    const explorer = await this.explorerRepository.findOneOrFail({
      chainId: ctx.chainId,
    });

    const { result, count } = await this.assetsRepository.getAssets(
      param.keyword,
      param.limit,
      param.offset,
      param.type,
      explorer.id,
    );

    const assetIds = result.map((item) => item.id);
    const tokenHolders = await this.tokenHolderStatisticRepo.find({
      where: {
        asset: { id: In(assetIds) },
        date: MoreThan(moment().subtract(2, 'days').toDate()),
      },
      loadRelationIds: true,
    });

    result.forEach((element) => {
      element.tokenHolderStatistics = tokenHolders.filter(
        (item) => Number(item.asset) === element.id,
      );
    });
    return { result, count };
  }

  async getAssetsDetail(ctx: RequestContext, denom: string) {
    this.logger.log(ctx, `${this.getAssetsDetail.name} was called!`);
    const explorer = await this.explorerRepository.findOne({
      chainId: ctx.chainId,
    });
    const result = await this.assetsRepository.getAssetsDetail(
      denom,
      explorer.id,
    );
    return result[0];
  }

  async getAssetsTokenMarket(
    ctx: RequestContext,
    param: AssetsTokenMarketParamsDto,
  ): Promise<Asset[]> {
    this.logger.log(ctx, `${this.getAssetsTokenMarket.name} was called!`);

    const explorer = await this.explorerRepository.findOne({
      chainId: ctx.chainId,
    });

    if (param.denom) {
      return await this.assetsRepository.find({
        where: { denom: param.denom, explorer: { id: explorer.id } },
      });
    } else {
      return await this.assetsRepository.find({
        where: { coinId: Not(''), explorer: { id: explorer.id } },
      });
    }
  }
}
