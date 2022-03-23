import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SharedModule } from '../../shared/shared.module';
import { BlockModule } from '../block/block.module';
import { DelegationRepository } from '../schedule/repositories/delegation.repository';
import { TransactionModule } from '../transaction/transaction.module';

import { ValidatorController } from './controllers/validator.controller';
import { ValidatorRepository } from './repositories/validator.repository';
import { ValidatorService } from './services/validator.service';

@Module({
  imports: [
    SharedModule,
    TypeOrmModule.forFeature([
      ValidatorRepository,
      DelegationRepository,
    ]),
    HttpModule,
    ConfigModule,
    BlockModule,
    TransactionModule,
  ],
  providers: [ValidatorService],
  controllers: [ValidatorController],
  exports: [ValidatorService],
})
export class ValidatorModule {}
