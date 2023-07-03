import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, FindOneOptions, Repository } from 'typeorm';

import { User } from '../../shared/entities/user.entity';
import { MESSAGES, PROVIDER, USER_ACTIVITIES, USER_ROLE } from '../../shared';
import { CreateUserDto } from './dtos/create-user.dto';
import { UserRepository } from './repositories/user.repository';
import { UpdateUserDto } from './dtos/update-user.dto';
import { randomBytes } from 'crypto';
import { MailService } from '../mail/mail.service';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { CreateUserWithPasswordDto } from '../../auth/password/dtos/create-user-with-password.dto';
import { UserActivity } from '../../shared/entities/user-activity.entity';

@Injectable()
export class UserService {
  private logger: Logger = new Logger(UserService.name);
  constructor(
    @InjectRepository(User)
    private usersRepository: UserRepository,
    @InjectRepository(UserActivity)
    private userActivityRepository: Repository<UserActivity>,
    private mailService: MailService,
    private configService: ConfigService,
  ) {}

  async findOne(params: FindOneOptions<User> = {}): Promise<User> {
    return await this.usersRepository.findOne(params);
  }

  async findOneById(id: number): Promise<User> {
    return await this.usersRepository.findOne({ id });
  }

  async findOneByEmail(email: string): Promise<User> {
    return await this.usersRepository.findOne({ email });
  }

  async findAll(): Promise<User[]> {
    return await this.usersRepository.find();
  }

  async create(user: CreateUserDto): Promise<User> {
    this.logger.log(`Creating user: ${JSON.stringify(user)}`);
    return await this.usersRepository.save(user);
  }

  async update(user: UpdateUserDto): Promise<User> {
    this.logger.log(`Updating user: ${JSON.stringify(user)}`);
    const foundUser = await this.findOne({ where: { id: user.id } });

    if (foundUser) {
      await this.usersRepository.merge(foundUser, user);
      return await this.usersRepository.save(foundUser);
    } else {
      throw new NotFoundException('User not found');
    }
  }

  async delete(id: number): Promise<void> {
    const foundUser = await this.findOne({ where: { id: id } });

    if (foundUser) {
      await this.usersRepository.delete(id);
    } else {
      throw new NotFoundException('User not found');
    }
  }

  checkRole(user: DeepPartial<User>): void {
    if (!user) {
      throw new UnauthorizedException(MESSAGES.ERROR.NOT_PERMISSION);
    }

    if (user.role === USER_ROLE.BANNED) {
      throw new UnauthorizedException(MESSAGES.ERROR.BANNED);
    }
  }

  async createUserWithPassword(
    userParams: CreateUserWithPasswordDto,
  ): Promise<void> {
    const newUser = new User();
    newUser.encryptedPassword = await bcrypt.hash(
      userParams.password,
      Number(this.configService.get('bcryptSalt')),
    );
    newUser.email = userParams.email;
    newUser.userName = userParams.userName;
    newUser.email = userParams.email;
    newUser.provider = PROVIDER.PASSWORD;
    newUser.role = USER_ROLE.USER;
    newUser.confirmationToken = await this.generateConfirmationToken();

    const newUserActivity = new UserActivity();
    newUserActivity.type = USER_ACTIVITIES.SEND_MAIL_CONFIRM;
    newUserActivity.sendMailAttempt = 1;
    newUserActivity.lastSendMailAttempt = new Date();

    newUser.userActivities = [newUserActivity];

    try {
      await this.usersRepository.manager.transaction(
        async (transactionalEntityManager) => {
          await transactionalEntityManager.save(newUser);
          await this.mailService.sendMailConfirmation(
            newUser,
            newUser.confirmationToken,
          );
          await transactionalEntityManager.save(newUser);
        },
      );
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async activeUser(email: string, token: string): Promise<void> {
    const userToActive = await this.findOne({
      where: { email: email, confirmationToken: token },
    });

    if (!userToActive) {
      throw new BadRequestException('User not found');
    }

    if (userToActive.confirmedAt) {
      throw new BadRequestException('User already active');
    }

    if (userToActive.confirmationToken === token) {
      userToActive.confirmedAt = new Date();
      await this.usersRepository.save(userToActive);
    }
  }

  async generateConfirmationToken(): Promise<string> {
    return randomBytes(20).toString('hex').slice(0, 20).toUpperCase();
  }

  async resendConfirmationEmail(user: User): Promise<void> {
    if (!user) {
      throw new BadRequestException('User have not registered.');
    }

    if (user.confirmedAt) {
      throw new BadRequestException('User already confirmed.');
    }

    if (user.provider != PROVIDER.PASSWORD) {
      throw new BadRequestException('User have not registered with password.');
    }

    try {
      const sendMailConfirmActivity = await this.userActivityRepository.findOne(
        {
          where: { user: user, type: USER_ACTIVITIES.SEND_MAIL_CONFIRM },
        },
      );
      const CONFIRMATION_TEXT = 'confirmation';

      this.limitSendMail(sendMailConfirmActivity, CONFIRMATION_TEXT);

      await this.mailService.sendMailConfirmation(
        user,
        user?.confirmationToken,
      );

      await this.userActivityRepository.save(sendMailConfirmActivity);
    } catch (error) {
      throw new BadRequestException(
        `Error while resend confirmation email: ${error.message}`,
      );
    }
  }

  limitSendMail(userActivity: UserActivity, type: string): void {
    //Check limit sent mail: 5 times per day, 5 minutes between each time.
    const FIVE_TIMES = 5;
    const lastSentMail = userActivity.lastSendMailAttempt;
    const currentTime = new Date();
    const fiveMinutesAgo = new Date(currentTime.getTime() - 5 * 60000);

    this.increaseSendMailAttempt(userActivity);

    if (lastSentMail > fiveMinutesAgo) {
      throw new BadRequestException(
        `Please wait for 5 minutes before sending another ${type} email.`,
      );
    }

    if (userActivity.sendMailAttempt > FIVE_TIMES) {
      throw new BadRequestException(
        `You have requested to send too many ${type} emails.`,
      );
    }
  }

  increaseSendMailAttempt(userActivity: UserActivity): void {
    // Check if last lastSendMailAttempt < 00:00 then init to 1;
    // Check if last lastSendMailAttempt > 00:00 then increase 1;
    const FIRST_TIME = 1;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const midnightTimestamp = today.getTime();
    const lastSendMailAttempt = new Date(userActivity.lastSendMailAttempt);

    if (lastSendMailAttempt.getTime() < midnightTimestamp) {
      userActivity.sendMailAttempt = FIRST_TIME;
    } else {
      userActivity.sendMailAttempt++;
    }

    userActivity.lastSendMailAttempt = new Date();
  }
}
