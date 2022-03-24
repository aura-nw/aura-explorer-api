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

@Module({
  imports: [
    SharedModule,
    ComponentsModule,
    ConfigModule,
    HttpModule,
    TransactionModule,
    BlockModule,
    ValidatorModule,
    WalletModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
