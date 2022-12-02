import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SharedModule } from '../../shared';
import { ContractUtil } from '../../shared/utils/contract.util';
import { ServiceUtil } from '../../shared/utils/service.util';
import { SmartContractRepository } from '../contract/repositories/smart-contract.repository';
import { SoulboundTokenController } from './controllers/soulbound-token.controller';
import { SoulboundTokenRepository } from './repositories/soulbound-token.repository';
import { SoulboundTokenService } from './services/soulbound-token.service';

@Module({
  imports: [
    SharedModule,
    TypeOrmModule.forFeature([
      SmartContractRepository,
      SoulboundTokenRepository,
    ]),
    ConfigModule,
    HttpModule,
  ],
  providers: [SoulboundTokenService, ServiceUtil, ContractUtil],
  controllers: [SoulboundTokenController],
  exports: [SoulboundTokenService],
})
export class SoulboundTokenModule {}
