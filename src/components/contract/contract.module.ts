import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServiceUtil } from '../../shared/utils/service.util';
import { SharedModule } from '../../shared';
import { ContractController } from './controllers/contract.controller';
import { ContractService } from './services/contract.service';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { TokenMarketsRepository } from '../cw20-token/repositories/token-markets.repository';
import { SoulboundTokenRepository } from '../soulbound-token/repositories/soulbound-token.repository';
import { ContractUtil } from '../../shared/utils/contract.util';

@Module({
  imports: [
    SharedModule,
    TypeOrmModule.forFeature([
      TokenMarketsRepository,
      SoulboundTokenRepository,
    ]),
    ConfigModule,
    HttpModule,
  ],
  providers: [ContractService, ServiceUtil, ContractUtil],
  controllers: [ContractController],
  exports: [ContractService],
})
export class ContractModule {}
