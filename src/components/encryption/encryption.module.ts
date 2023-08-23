import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SharedModule } from '../../shared/shared.module';
import { UserModule } from '../user/user.module';
import { EncryptionService } from '../encryption/encryption.service';
import { CipherKey } from '../../shared/entities/cipher-key.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CipherKey]), ConfigModule],
  providers: [EncryptionService],
  controllers: [],
  exports: [],
})
export class EncryptionModule {}
