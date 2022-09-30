import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ServiceUtil } from '../../shared/utils/service.util';
import { SharedModule } from "../../shared";
import { DelegationRepository } from '../validator/repositories/delegation.repository';
import { ProposalController } from './controllers/proposal.controller';
import { ProposalService } from './services/proposal.service';

@Module({
    imports: [
      SharedModule,
      TypeOrmModule.forFeature([
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