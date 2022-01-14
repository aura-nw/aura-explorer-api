import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SharedModule } from '../../shared/shared.module';

import { BlockRepository } from './repositories/block.repository';
import { TransactionRepository } from './repositories/transaction.repository';
import { SyncStatusRepository } from './repositories/syns-status.repository';
import { TaskService } from './services/task.service';

@Module({
  imports: [
    SharedModule,
    HttpModule,
    TypeOrmModule.forFeature([
      SyncStatusRepository,
      BlockRepository,
      TransactionRepository,
    ]),
    ConfigModule,
  ],
  providers: [TaskService],
})
export class TaskModule {}
