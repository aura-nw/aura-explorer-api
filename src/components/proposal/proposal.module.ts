import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ServiceUtil } from '../../shared/utils/service.util';
import { SharedModule } from "../../shared";
import { BlockRepository } from '../block/repositories/block.repository';
import { DelegationRepository } from '../schedule/repositories/delegation.repository';
import { ValidatorRepository } from '../validator/repositories/validator.repository';
import { ProposalController } from './controllers/proposal.controller';
import { HistoryProposalRepository } from './repositories/history-proposal.reponsitory';
import { ProposalDepositRepository } from './repositories/proposal-deposit.repository';
import { ProposalVoteRepository } from './repositories/proposal-vote.repository';
import { ProposalRepository } from './repositories/proposal.repository';
import { ProposalService } from './services/proposal.service';

@Module({
    imports: [
      SharedModule,
      TypeOrmModule.forFeature([
        ProposalRepository, 
        BlockRepository, 
        ProposalVoteRepository,
        HistoryProposalRepository,
        ValidatorRepository,
        ProposalDepositRepository,
        DelegationRepository
      ]),
      HttpModule,
      ConfigModule,
    ],
    providers: [ProposalService, ServiceUtil],
    controllers: [ProposalController],
    exports: [ProposalService],
  })
  export class ProposalModule {}