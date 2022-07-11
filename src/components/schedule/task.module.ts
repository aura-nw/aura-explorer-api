import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SharedModule } from '../../shared/shared.module';

import { BlockRepository } from './repositories/block.repository';
import { TransactionRepository } from './repositories/transaction.repository';
import { SyncStatusRepository } from './repositories/syns-status.repository';
import { ValidatorRepository } from './repositories/validator.repository';
import { DelegationRepository } from './repositories/delegation.repository';
import { ProposalVoteRepository } from '../proposal/repositories/proposal-vote.repository';
import { MissedBlockRepository } from './repositories/missed-block.repository';
import { HistoryProposalRepository } from '../proposal/repositories/history-proposal.reponsitory';
import { ScheduleModule } from 'nest-schedule';
import { BlockSyncErrorRepository } from './repositories/block-sync-error.repository';
import { ProposalDepositRepository } from '../proposal/repositories/proposal-deposit.repository';
import { DelegatorRewardRepository } from './repositories/delegator-reward.repository';

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
      ProposalVoteRepository,
      MissedBlockRepository,
      HistoryProposalRepository,
      BlockSyncErrorRepository,
      ProposalDepositRepository,
      DelegatorRewardRepository
    ]),
    ConfigModule,
    ScheduleModule.register()
  ],
  providers: [],
})
export class TaskModule {}
