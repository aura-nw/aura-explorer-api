import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SharedModule } from '../../shared';
import { ContractUtil } from '../../shared/utils/contract.util';
import { ServiceUtil } from '../../shared/utils/service.util';
import { SoulboundTokenController } from './controllers/soulbound-token.controller';
import { SoulboundTokenRepository } from './repositories/soulbound-token.repository';
import { SoulboundTokenService } from './services/soulbound-token.service';
import { RedisUtil } from '../../shared/utils/redis.util';
import { SoulboundWhiteListRepository } from './repositories/soulbound-white-list.repository';
import { SoulboundRejectList } from '../../shared/entities/soulbound-reject-list.entity';
import { SoulboundRejectListRepository } from './repositories/soulbound-reject-list.repository';

@Module({
  imports: [
    SharedModule,
    TypeOrmModule.forFeature([
      SoulboundTokenRepository,
      SoulboundWhiteListRepository,
      SoulboundRejectListRepository,
      SoulboundRejectList,
    ]),
    ConfigModule,
    HttpModule,
  ],
  providers: [SoulboundTokenService, ServiceUtil, ContractUtil, RedisUtil],
  controllers: [SoulboundTokenController],
  exports: [SoulboundTokenService],
})
export class SoulboundTokenModule {}
