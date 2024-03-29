import { Module } from '@nestjs/common';
import { ChainInfoService } from './chain-info.service';
import { ChainInfoController } from './chain-info.controller';
import { ChainInfo } from '../../shared/entities/chain-info.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IsUniqueConstraint } from './validator/is-unique.validator';
import { UserModule } from '../user/user.module';

@Module({
  imports: [TypeOrmModule.forFeature([ChainInfo]), UserModule],
  controllers: [ChainInfoController],
  providers: [ChainInfoService, IsUniqueConstraint],
})
export class ChainInfoModule {}
