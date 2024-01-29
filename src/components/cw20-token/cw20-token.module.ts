import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServiceUtil } from '../../shared/utils/service.util';
import { SharedModule, TokenMarkets } from '../../shared';
import { Cw20TokenController } from './controllers/cw20-token.controller';
import { Cw20TokenService } from './services/cw20-token.service';
import { RedisUtil } from '../../shared/utils/redis.util';
import { AccountService } from '../account/services/account.service';
import { TokenMarketsRepository } from './repositories/token-markets.repository';
import { UserModule } from '../user/user.module';
import { IsUniqueConstraint } from './validators/is-unique.validator';
import { IsUniqueManyColumnConstraint } from './validators/is-unique-many-column.validator';
import { Explorer } from 'src/shared/entities/explorer.entity';

@Module({
  imports: [
    SharedModule,
    TypeOrmModule.forFeature([TokenMarkets, TokenMarketsRepository, Explorer]),
    ConfigModule,
    HttpModule,
    UserModule,
  ],
  providers: [
    Cw20TokenService,
    ServiceUtil,
    RedisUtil,
    AccountService,
    IsUniqueConstraint,
    IsUniqueManyColumnConstraint,
  ],
  controllers: [Cw20TokenController],
  exports: [Cw20TokenService],
})
export class Cw20TokenModule {}
