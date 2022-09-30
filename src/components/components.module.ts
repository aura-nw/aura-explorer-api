import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';

import { SharedModule } from '../shared/shared.module';

import { BlockModule } from './block/block.module';
import { MetricModule } from './metric/metric.module';
import { TransactionModule } from './transaction/transaction.module';
import { ValidatorModule } from './validator/validator.module';

@Module({
  imports: [
    SharedModule,
    BlockModule,
    TransactionModule,
    MetricModule,
    ValidatorModule,
    ScheduleModule.forRoot(),
  ],
})
export class ComponentsModule { }
