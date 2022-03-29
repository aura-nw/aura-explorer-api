import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SharedModule } from '../../shared/shared.module';
import { TransactionRepository } from '../transaction/repositories/transaction.repository';
import { TransactionModule } from '../transaction/transaction.module';
import { ValidatorRepository } from '../validator/repositories/validator.repository';

import { AccountController } from './controllers/account.controller';
import { AccountService } from './services/account.service';

@Module({
  imports: [
    SharedModule,
    HttpModule,
    ConfigModule,
    TypeOrmModule.forFeature([
      ValidatorRepository,
      TransactionRepository,
    ]),
    TransactionModule,
  ],
  providers: [AccountService],
  controllers: [AccountController],
  exports: [AccountService],
})
export class AccountModule {}
