import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { SharedModule } from './shared/shared.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ComponentsModule } from './components/components.module';
import { TransactionModule } from './components/transaction/transaction.module';
import { BlockModule } from './components/block/block.module';
import { ValidatorModule } from './components/validator/validator.module';
import { ProposalModule } from './components/proposal/proposal.module';
import { AccountModule } from './components/account/account.module';
import { ServiceUtil } from './shared/utils/service.util';
import { ContractModule } from './components/contract/contract.module';
import { ContractCodeModule } from './components/contract-code/contract-code.module';
import { SyncStatusRepository } from './components/block/repositories/syns-status.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cw20TokenModule } from './components/cw20-token/cw20-token.module';
import { Cw721TokenModule } from './components/cw721-token/cw721-token.module';
import { MetricService } from './components/metric/services/metric.service';

@Module({
  imports: [
    SharedModule,
    ComponentsModule,
    ConfigModule,
    HttpModule,
    TransactionModule,
    BlockModule,
    ValidatorModule,
    ProposalModule,
    AccountModule,
    ContractModule,
    ContractCodeModule,
    Cw20TokenModule,
    Cw721TokenModule,
    TypeOrmModule.forFeature([SyncStatusRepository])
  ],
  controllers: [AppController],
  providers: [AppService, ServiceUtil, MetricService],
})
export class AppModule {}
