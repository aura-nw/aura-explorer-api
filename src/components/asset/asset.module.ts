import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SharedModule } from '../../shared/shared.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AssetService } from './services/asset.service';
import { AssetController } from './controllers/asset.controller';
import { Asset } from 'src/shared';
import { AssetsRepository } from './repositories/assets.repository';
import { TokenHolderStatistic } from 'src/shared/entities/token-holder-statistic.entity';
import { Explorer } from 'src/shared/entities/explorer.entity';
import { UserModule } from '../user/user.module';
import { UserAuthorityModule } from '../user-authority/user-authority.module';

@Module({
  imports: [
    SharedModule,
    HttpModule,
    ConfigModule,
    UserModule,
    TypeOrmModule.forFeature([
      Asset,
      AssetsRepository,
      TokenHolderStatistic,
      Explorer,
    ]),
    UserAuthorityModule,
  ],
  providers: [AssetService],
  controllers: [AssetController],
  exports: [AssetService],
})
export class AssetModule {}
