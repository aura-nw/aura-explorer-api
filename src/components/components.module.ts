import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { SharedModule } from '../shared/shared.module';
import { MetricModule } from './metric/metric.module';

@Module({
  imports: [SharedModule, MetricModule, ScheduleModule.forRoot()],
})
export class ComponentsModule {}
