import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SharedModule } from 'src/shared';

import { MetricController } from './controllers/metric.controller';
import { MetricService } from './services/metric.service';

@Module({
  imports: [
    SharedModule,
    ConfigModule
  ],
  providers: [MetricService],
  controllers: [MetricController],
  exports: [MetricService],
})
export class MetricModule { }
