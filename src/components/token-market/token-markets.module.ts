import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SharedModule } from '../../shared/shared.module';
import { ServiceUtil } from 'src/shared/utils/service.util';
import { TokenMarketsRepository } from '../cw20-token/repositories/token-markets.repository';
import { TokenMarketService } from './services/token-market.service';
import { TokenMarketController } from './controllers/token-market.controller';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    SharedModule,
    TypeOrmModule.forFeature([TokenMarketsRepository]),
    HttpModule,
    ConfigModule,
    UserModule,
  ],
  providers: [TokenMarketService, ServiceUtil],
  controllers: [TokenMarketController],
  exports: [TokenMarketService],
})
export class TokenMarketModule {}
