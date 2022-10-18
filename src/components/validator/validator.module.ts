import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServiceUtil } from '../../shared/utils/service.util';

import { SharedModule } from '../../shared/shared.module';
import { BlockModule } from '../block/block.module';
import { BlockRepository } from '../block/repositories/block.repository';
import { ProposalVoteRepository } from './repositories/proposal-vote.repository';
import { DelegationRepository } from './repositories/delegation.repository';

import { ValidatorController } from './controllers/validator.controller';
import { ValidatorRepository } from './repositories/validator.repository';
import { ValidatorService } from './services/validator.service';
import { DelegatorRewardRepository } from './repositories/delegator-reward.repository';

@Module({
  imports: [
    SharedModule,
    TypeOrmModule.forFeature([
      ValidatorRepository,
      DelegationRepository,
      BlockRepository,
      ProposalVoteRepository,
      DelegatorRewardRepository
    ]),
    HttpModule,
    ConfigModule,
    BlockModule,
  ],
  providers: [ValidatorService, ServiceUtil],
  controllers: [ValidatorController],
  exports: [ValidatorService],
})
export class ValidatorModule {}
