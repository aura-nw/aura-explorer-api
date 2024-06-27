import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SharedModule } from '../../shared/shared.module';
import { NotificationRepository } from '../queues/notification/repositories/notification.repository';
import { NotificationService } from './services/notification.service';
import { NotificationController } from './controllers/notification.controller';
import { UserModule } from '../user/user.module';
import { UserActivity } from '../../shared/entities/user-activity.entity';
import { Explorer } from 'src/shared/entities/explorer.entity';
import { UserAuthorityModule } from '../user-authority/user-authority.module';

@Module({
  imports: [
    SharedModule,
    TypeOrmModule.forFeature([NotificationRepository, UserActivity, Explorer]),
    HttpModule,
    ConfigModule,
    UserModule,
    UserAuthorityModule,
  ],
  providers: [NotificationService],
  controllers: [NotificationController],
  exports: [NotificationService],
})
export class NotificationModule {}
