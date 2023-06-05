import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SharedModule } from '../../shared/shared.module';
import { NameTagController } from './controllers/name-tag.controller';
import { NameTagRepository } from './repositories/name-tag.repository';
import { NameTagService } from './services/name-tag.service';

@Module({
  imports: [
    SharedModule,
    TypeOrmModule.forFeature([NameTagRepository]),
    HttpModule,
    ConfigModule,
  ],
  providers: [NameTagService],
  controllers: [NameTagController],
  exports: [NameTagService],
})
export class NameTagModule {}
