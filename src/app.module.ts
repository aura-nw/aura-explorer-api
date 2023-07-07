import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { SharedModule } from './shared/shared.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ComponentsModule } from './components/components.module';
import { AccountModule } from './components/account/account.module';
import { ServiceUtil } from './shared/utils/service.util';
import { ContractModule } from './components/contract/contract.module';
import { Cw20TokenModule } from './components/cw20-token/cw20-token.module';
import { MetricService } from './components/metric/services/metric.service';
import { SoulboundTokenModule } from './components/soulbound-token/soulbound-token.module';
import { NameTagModule } from './components/name-tag/name-tag.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    AuthModule,
    SharedModule,
    ComponentsModule,
    ConfigModule,
    HttpModule,
    AccountModule,
    ContractModule,
    Cw20TokenModule,
    SoulboundTokenModule,
    NameTagModule,
  ],
  controllers: [AppController],
  providers: [AppService, ServiceUtil, MetricService],
})
export class AppModule {}
