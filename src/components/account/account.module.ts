import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServiceUtil } from '../../shared/utils/service.util';

import { SharedModule } from '../../shared/shared.module';

import { AccountController } from './controllers/account.controller';
import { AccountService } from './services/account.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Explorer } from 'src/shared/entities/explorer.entity';

@Module({
  imports: [
    SharedModule,
    HttpModule,
    ConfigModule,
    TypeOrmModule.forFeature([Explorer]),
  ],
  providers: [AccountService, ServiceUtil],
  controllers: [AccountController],
  exports: [AccountService],
})
export class AccountModule {}
