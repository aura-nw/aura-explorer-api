import { Logger, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../shared/entities/user.entity';
import { UserService } from './user.service';
import { UsersController } from './controllers/users.controller';
import { MailService } from '../mail/mail.service';
import { IsUniqueConstraint } from './validators/validate-unique';
import { MatchPasswordConstraint } from './validators/validate-match-password';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
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
