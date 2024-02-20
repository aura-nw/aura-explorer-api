import { Injectable } from '@nestjs/common';
import { ASSETS_TYPE, AkcLogger, Asset, RequestContext } from '../../../shared';
import { AssetsRepository } from '../../asset/repositories/assets.repository';
import { AssetParamsDto } from '../dtos/asset-params.dto';
import { AssetsTokenMarketParamsDto } from '../dtos/cw20-token-market-params.dto';

@Injectable()
export class AssetService {
  constructor(
    private readonly logger: AkcLogger,
    private assetsRepository: AssetsRepository,
  ) {}

  async getAssets(ctx: RequestContext, param: AssetParamsDto) {
    this.logger.log(ctx, `${this.getAssets.name} was called!`);
    const { result, count } = await this.assetsRepository.getAssets(param);
    // Move native coin to first element.
    result.sort((a, b) => {
      if (a.type == b.type) return 0;
      if (a.type == ASSETS_TYPE.NATIVE) return -1;
      if (b.type == ASSETS_TYPE.NATIVE) return 1;
    });

    return { result, count };
  }

  async getAssetsTokenMarket(
    ctx: RequestContext,
    param: AssetsTokenMarketParamsDto,
  ): Promise<Asset[]> {
    this.logger.log(ctx, `${this.getAssetsTokenMarket.name} was called!`);

    if (param.denom) {
      return await this.assetsRepository.find({
        where: [{ denom: param.denom }],
      });
    } else if (param.onlyIbc === 'true') {
      return await this.assetsRepository.getTokenWithStatistics();
    } else {
      return await this.assetsRepository.find();
    }
  }
}
