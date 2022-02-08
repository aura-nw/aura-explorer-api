import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { SharedModule } from '../../shared/shared.module';

import { ValidatorController } from './controllers/validator.controller';
import { ValidatorService } from './services/validator.service';

@Module({
  imports: [
    SharedModule,
    HttpModule,
    ConfigModule,
  ],
  providers: [ValidatorService],
  controllers: [ValidatorController],
  exports: [ValidatorService],
})
export class ValidatorModule {}
