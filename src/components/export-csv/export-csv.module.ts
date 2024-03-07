import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { ExportCsvService } from './services/export-csv.service';
import { ExportCsvController } from './controllers/export-csv.controller';
import { ServiceUtil } from '../../shared/utils/service.util';
import { SharedModule } from '../../shared/shared.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PrivateNameTagRepository } from '../private-name-tag/repositories/private-name-tag.repository';
import { EncryptionService } from '../encryption/encryption.service';
import { CipherKey } from '../../shared/entities/cipher-key.entity';
import { UserModule } from '../user/user.module';
import { Explorer } from 'src/shared/entities/explorer.entity';
import { AssetsRepository } from '../asset/repositories/assets.repository';

@Module({
  imports: [
    SharedModule,
    HttpModule,
    ConfigModule,
    UserModule,
    TypeOrmModule.forFeature([
      PrivateNameTagRepository,
      CipherKey,
      AssetsRepository,
      Explorer,
    ]),
  ],
  providers: [ExportCsvService, EncryptionService, ServiceUtil],
  controllers: [ExportCsvController],
  exports: [],
})
export class ExportCsvModule {}
