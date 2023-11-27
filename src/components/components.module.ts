import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { SharedModule } from '../shared/shared.module';

@Module({
  imports: [SharedModule, ScheduleModule.forRoot()],
})
export class ComponentsModule {}
