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
import { WalletModule } from './components/wallet/wallet.module';
import { ProposalModule } from './components/proposal/proposal.module';
import { AccountModule } from './components/account/account.module';
import { ServiceUtil } from './shared/utils/service.util';
import { ContractModule } from './components/contract/contract.module';

@Module({
  imports: [
    SharedModule,
    ComponentsModule,
    ConfigModule,
    HttpModule,
    TransactionModule,
    BlockModule,
    ValidatorModule,
    WalletModule,
    ProposalModule,
    AccountModule,
    ContractModule
  ],
  controllers: [AppController],
  providers: [AppService, ServiceUtil],
})
export class AppModule {}
