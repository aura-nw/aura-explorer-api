import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { ExportCsvService } from './services/export-csv.service';
import { ExportCsvController } from './controllers/export-csv.controller';
import { ServiceUtil } from '../../shared/utils/service.util';
import { SharedModule } from '../../shared/shared.module';

@Module({
  imports: [SharedModule, HttpModule, ConfigModule],
  providers: [ExportCsvService, ServiceUtil],
  controllers: [ExportCsvController],
  exports: [],
})
export class ExportCsvModule {}
