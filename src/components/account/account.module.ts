import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServiceUtil } from '../../shared/utils/service.util';

import { SharedModule } from '../../shared/shared.module';

import { AccountController } from './controllers/account.controller';
import { AccountService } from './services/account.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Explorer } from 'src/shared/entities/explorer.entity';
import { RpcUtil } from 'src/shared/utils/rpc.util';

@Module({
  imports: [
    SharedModule,
    HttpModule,
    ConfigModule,
    TypeOrmModule.forFeature([Explorer]),
  ],
  providers: [AccountService, ServiceUtil, RpcUtil],
  controllers: [AccountController],
  exports: [AccountService],
})
export class AccountModule {}
