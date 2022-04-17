import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServiceUtil } from 'src/shared/utils/service.util';

import { SharedModule } from '../../shared/shared.module';
import { DelegatioController } from './controllers/delegation.controller';
import { DelegationRepository } from './repositories/delegation.repository';
import { DelegationService } from './services/delegation.service';


@Module({
  imports: [
    SharedModule,
    TypeOrmModule.forFeature([
      DelegationRepository
    ]),
    HttpModule,
    ConfigModule,
  ],
  providers: [
    ServiceUtil,
    DelegationService
  ],
  controllers: [DelegatioController],
  exports: [DelegationService],
})
export class DelegationModule {}
