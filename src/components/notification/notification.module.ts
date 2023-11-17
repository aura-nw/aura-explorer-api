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

@Module({
  imports: [
    SharedModule,
    TypeOrmModule.forFeature([NotificationRepository, UserActivity]),
    HttpModule,
    ConfigModule,
    UserModule,
  ],
  providers: [NotificationService],
  controllers: [NotificationController],
  exports: [NotificationService],
})
export class NotificationModule {}
