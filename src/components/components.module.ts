import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';

import { SharedModule } from '../shared/shared.module';

import { BlockModule } from './block/block.module';
import { MetricModule } from './metric/metric.module';
import { TaskModule } from './schedule/task.module';
import { TransactionModule } from './transaction/transaction.module';

@Module({
  imports: [
    SharedModule,
    BlockModule,
    TransactionModule,
    TaskModule,
    MetricModule,
    ScheduleModule.forRoot(),
  ],
})
export class ComponentsModule { }
