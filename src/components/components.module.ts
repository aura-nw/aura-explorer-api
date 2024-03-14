import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { SharedModule } from '../shared/shared.module';
import { ChainInfoModule } from './chain-info/chain-info.module';

@Module({
  imports: [SharedModule, ScheduleModule.forRoot(), ChainInfoModule],
})
export class ComponentsModule {}
