import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SharedModule } from '../../shared/shared.module';
import { PrivateNameTagController } from './controllers/private-name-tag.controller';
import { PrivateNameTagRepository } from './repositories/private-name-tag.repository';
import { PrivateNameTagService } from './services/private-name-tag.service';
import { UserModule } from '../user/user.module';
import { EncryptionService } from '../encryption/encryption.service';
import { CipherKey } from '../../shared/entities/cipher-key.entity';
import { ServiceUtil } from '../../shared/utils/service.util';
import { Explorer } from 'src/shared/entities/explorer.entity';
import { VerifyAddressUtil } from '../../shared/utils/verify-address.util';
import { RpcUtil } from '../../shared/utils/rpc.util';
import { UserAuthorityModule } from '../user-authority/user-authority.module';

@Module({
  imports: [
    SharedModule,
    TypeOrmModule.forFeature([PrivateNameTagRepository, CipherKey, Explorer]),
    HttpModule,
    ConfigModule,
    UserModule,
    UserAuthorityModule,
  ],
  providers: [
    PrivateNameTagService,
    EncryptionService,
    ServiceUtil,
    VerifyAddressUtil,
    RpcUtil,
  ],
  controllers: [PrivateNameTagController],
  exports: [PrivateNameTagService],
})
export class PrivateNameTagModule {}
