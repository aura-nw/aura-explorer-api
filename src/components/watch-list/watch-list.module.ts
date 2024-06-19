import { Module } from '@nestjs/common';
import { WatchListService } from './watch-list.service';
import { WatchListController } from './controllers/watch-list.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WatchList } from '../../shared/entities/watch-list.entity';
import { UserModule } from '../user/user.module';
import { PublicNameTag } from '../../shared/entities/public-name-tag.entity';
import { PrivateNameTag } from '../../shared/entities/private-name-tag.entity';
import { EncryptionService } from '../encryption/encryption.service';
import { CipherKey } from '../../shared/entities/cipher-key.entity';
import { Explorer } from 'src/shared/entities/explorer.entity';
import { AkcLogger, SharedModule } from 'src/shared';
import { VerifyAddressUtil } from '../../shared/utils/verify-address.util';
import { RpcUtil } from '../../shared/utils/rpc.util';

@Module({
  imports: [
    SharedModule,
    TypeOrmModule.forFeature([
      WatchList,
      PublicNameTag,
      PrivateNameTag,
      CipherKey,
      Explorer,
    ]),
    UserModule,
  ],
  controllers: [WatchListController],
  providers: [
    WatchListService,
    EncryptionService,
    AkcLogger,
    VerifyAddressUtil,
    RpcUtil,
  ],
})
export class WatchListModule {}
