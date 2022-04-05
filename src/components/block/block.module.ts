import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SharedModule } from '../../shared/shared.module';
import { MissedBlockRepository } from '../schedule/repositories/missed-block.repository';

import { TransactionModule } from '../transaction/transaction.module';
import { ValidatorRepository } from '../validator/repositories/validator.repository';

import { BlockController } from './controllers/block.controller';
import { BlockRepository } from './repositories/block.repository';
import { BlockService } from './services/block.service';

@Module({
  imports: [
    SharedModule,
    TypeOrmModule.forFeature([
      BlockRepository,
      MissedBlockRepository,
      ValidatorRepository,
    ]),
    HttpModule,
    ConfigModule,
    TransactionModule,
  ],
  providers: [BlockService],
  controllers: [BlockController],
  exports: [BlockService],
})
export class BlockModule {}
