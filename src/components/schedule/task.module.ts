import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SharedModule } from '../../shared/shared.module';

import { BlockRepository } from './repositories/block.repository';
import { TransactionRepository } from './repositories/transaction.repository';
import { SyncStatusRepository } from './repositories/syns-status.repository';
import { TaskService } from './services/task.service';
import { ValidatorRepository } from './repositories/validator.repository';
import { DelegationRepository } from './repositories/delegation.repository';
import { ProposalVoteRepository } from '../proposal/repositories/proposal-vote.repository';

@Module({
  imports: [
    SharedModule,
    HttpModule,
    TypeOrmModule.forFeature([
      SyncStatusRepository,
      BlockRepository,
      TransactionRepository,
      ValidatorRepository,
      DelegationRepository,
      ProposalVoteRepository
    ]),
    ConfigModule,
  ],
  providers: [TaskService],
})
export class TaskModule {}
