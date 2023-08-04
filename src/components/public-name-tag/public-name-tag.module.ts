import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SharedModule } from '../../shared/shared.module';
import { PublicNameTagController } from './controllers/public-name-tag.controller';
import { PublicNameTagRepository } from './repositories/public-name-tag.repository';
import { PublicNameTagService } from './services/public-name-tag.service';
import { UserModule } from '../user/user.module';
import { ServiceUtil } from 'src/shared/utils/service.util';

@Module({
  imports: [
    SharedModule,
    TypeOrmModule.forFeature([PublicNameTagRepository]),
    HttpModule,
    ConfigModule,
    UserModule,
  ],
  providers: [PublicNameTagService, ServiceUtil],
  controllers: [PublicNameTagController],
  exports: [PublicNameTagService],
})
export class PublicNameTagModule {}
