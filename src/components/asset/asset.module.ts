import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SharedModule } from '../../shared/shared.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AssetService } from './services/asset.service';
import { AssetController } from './controllers/asset.controller';
import { Asset } from 'src/shared';
import { AssetsRepository } from './repositories/assets.repository';

@Module({
  imports: [
    SharedModule,
    HttpModule,
    ConfigModule,
    TypeOrmModule.forFeature([Asset, AssetsRepository]),
  ],
  providers: [AssetService],
  controllers: [AssetController],
  exports: [AssetService],
})
export class AssetModule {}
