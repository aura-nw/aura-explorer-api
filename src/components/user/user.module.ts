import { Logger, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../shared/entities/user.entity';
import { UserService } from './user.service';
import { UsersController } from './controllers/users.controller';
import { MailService } from '../mail/mail.service';
import { IsUniqueConstraint } from './validators/validate-unique';
import { MatchPasswordConstraint } from './validators/validate-match-password';
import { UserActivity } from '../../shared/entities/user-activity.entity';
import { SendMailModule } from '../queues/send-mail/send-mail.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    TypeOrmModule.forFeature([UserActivity]),
    SendMailModule,
  ],
  providers: [
    UserService,
    Logger,
    MailService,
    IsUniqueConstraint,
    MatchPasswordConstraint,
  ],
  exports: [UserService],
  controllers: [UsersController],
})
export class UserModule {}
