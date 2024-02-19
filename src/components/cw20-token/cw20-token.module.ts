import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServiceUtil } from '../../shared/utils/service.util';
import { Asset, SharedModule, TokenMarkets } from '../../shared';
import { Cw20TokenController } from './controllers/cw20-token.controller';
import { Cw20TokenService } from './services/cw20-token.service';
import { TokenMarketsRepository } from './repositories/token-markets.repository';
import { UserModule } from '../user/user.module';
import { IsUniqueConstraint } from './validators/is-unique.validator';
import { IsUniqueManyColumnConstraint } from './validators/is-unique-many-column.validator';
import { Explorer } from 'src/shared/entities/explorer.entity';
import { AssetsRepository } from './repositories/assets.repository';

@Module({
  imports: [
    SharedModule,
    TypeOrmModule.forFeature([
      TokenMarkets,
      TokenMarketsRepository,
      AssetsRepository,
      Explorer,
      Asset,
    ]),
    ConfigModule,
    HttpModule,
    UserModule,
  ],
  providers: [
    Cw20TokenService,
    ServiceUtil,
    IsUniqueConstraint,
    IsUniqueManyColumnConstraint,
  ],
  controllers: [Cw20TokenController],
  exports: [Cw20TokenService],
})
export class Cw20TokenModule {}
